import { NextRequest, NextResponse } from "next/server";

import Replicate from "replicate";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  authenticateBearerUser,
} from "../../lib/supabase-admin";

import {
  isHttpImageUrl,
  normalizeImageUrlList,
} from "../../lib/image-url";

const GENERATION_IMAGES_BUCKET =
  "generation-images";

function getReplicate() {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    throw new Error("Replicate is not configured");
  }

  return new Replicate({ auth: token });
}

type DbErrorEntry = {
  imageUrl: string;
  message: string;
  code?: string;
  details?: string;
};

async function persistImageToStorage(
  supabase: SupabaseClient,
  userId: string,
  remoteUrl: string,
  index: number
): Promise<string> {
  const response = await fetch(remoteUrl, {
    headers: {
      Accept: "image/*",
      "User-Agent": "InfluAI-Image-Persist/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch image (${response.status})`
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  const bytes = new Uint8Array(arrayBuffer);

  if (bytes.byteLength === 0) {
    throw new Error("Fetched image is empty");
  }

  const storagePath = `${userId}/${Date.now()}-${index}.webp`;

  const { error: uploadError } =
    await supabase.storage
      .from(GENERATION_IMAGES_BUCKET)
      .upload(storagePath, bytes, {
        contentType: "image/webp",
        upsert: false,
      });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(GENERATION_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  if (!data.publicUrl) {
    throw new Error(
      "Failed to resolve public storage URL"
    );
  }

  return data.publicUrl;
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user, error: authError } =
      await authenticateBearerUser(req);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError ?? "Unauthorized" },
        { status: 401 }
      );
    }

    const replicate = getReplicate();

    const body = await req.json();

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    const characterId =
      typeof body.characterId === "string" &&
      body.characterId.trim()
        ? body.characterId.trim()
        : null;

    if (!prompt || prompt.startsWith("undefined")) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const { count: generationCount, error: countError } =
      await supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    if (countError) {
      console.error("GENERATION COUNT ERROR:", countError.message);
      return NextResponse.json(
        { error: "Failed to verify usage" },
        { status: 500 }
      );
    }

    const { data: creditsRow, error: creditsError } =
      await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

    if (creditsError) {
      console.error("CREDITS LOAD ERROR:", creditsError.message);
      return NextResponse.json(
        { error: "Failed to verify credits" },
        { status: 500 }
      );
    }

    const creditsBefore = creditsRow?.credits ?? 0;
    const priorGenerations = generationCount ?? 0;
    const freeGenerationUsed = priorGenerations >= 1;

    let allowedImages = 0;
    let usingFreeGeneration = false;

    if (creditsBefore > 0) {
      allowedImages = Math.min(4, creditsBefore);
      usingFreeGeneration = false;
    } else if (priorGenerations === 0) {
      allowedImages = 4;
      usingFreeGeneration = true;
    } else {
      console.log("FREE_USAGE_STATE", {
        priorGenerations,
        creditsBefore,
        freeGenerationUsed: true,
        blocked: true,
      });

      return NextResponse.json(
        {
          error: "Payment required",
          paymentRequired: true,
          freeGenerationUsed: true,
          credits: 0,
        },
        { status: 402 }
      );
    }

    console.log("FREE_USAGE_STATE", {
      priorGenerations,
      freeGenerationUsed,
      usingFreeGeneration,
    });

    console.log("CREDITS_STATE", {
      creditsBefore,
      creditsRow: creditsRow ?? null,
    });

    console.log("ALLOWED_IMAGES", allowedImages);

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt,
          num_outputs: allowedImages,
          output_format: "jpg",
          output_quality: 90,
        },
      }
    );

    const allImages = await normalizeImageUrlList(
      output
    );

    const replicateUrls = allImages
      .filter(isHttpImageUrl)
      .slice(0, allowedImages);

    if (replicateUrls.length === 0) {
      console.error("REPLICATE OUTPUT HAD NO VALID URLS", {
        outputType: typeof output,
        rawCount: Array.isArray(output)
          ? output.length
          : 1,
      });

      return NextResponse.json(
        { error: "No images returned from Replicate" },
        { status: 500 }
      );
    }

    const images: string[] = [];

    for (
      let index = 0;
      index < replicateUrls.length;
      index += 1
    ) {
      const replicateUrl = replicateUrls[index];

      try {
        const publicUrl =
          await persistImageToStorage(
            supabase,
            user.id,
            replicateUrl,
            index
          );

        images.push(publicUrl);

        console.log("STORAGE_UPLOAD_OK", {
          index,
          storagePath: `${user.id}/…-${index}.webp`,
        });
      } catch (storageError) {
        console.error(
          "STORAGE UPLOAD ERROR:",
          storageError instanceof Error
            ? storageError.message
            : storageError,
          { replicateUrl, index }
        );

        images.push(replicateUrl);
      }
    }

    let savedCount = 0;
    const dbErrors: DbErrorEntry[] = [];

    for (const imageUrl of images) {
      if (!isHttpImageUrl(imageUrl)) {
        continue;
      }

      const { data, error } = await supabase
        .from("generations")
        .insert({
          prompt,
          image_url: imageUrl,
          model: "flux-schnell",
          character_id: characterId,
          user_id: user.id,
          favorite: false,
        })
        .select("id")
        .single();

      if (error) {
        console.error(
          "GENERATIONS INSERT ERROR:",
          JSON.stringify(error, null, 2)
        );

        dbErrors.push({
          imageUrl,
          message: error.message,
          code: error.code,
          details: error.details
            ? String(error.details)
            : undefined,
        });
      } else if (data?.id) {
        savedCount += 1;
      }
    }

    let creditsAfter = creditsBefore;

    if (!usingFreeGeneration && savedCount > 0) {
      creditsAfter = Math.max(
        0,
        creditsBefore - savedCount
      );

      const { error: decrementError } = await supabase
        .from("user_credits")
        .upsert(
          {
            user_id: user.id,
            credits: creditsAfter,
          },
          { onConflict: "user_id" }
        );

      if (decrementError) {
        console.error(
          "CREDITS DECREMENT ERROR:",
          decrementError.message
        );
      }
    }

    console.log(
      `Generated ${images.length} image URL(s), saved ${savedCount}`
    );

    return NextResponse.json({
      success: true,
      images,
      savedCount,
      dbErrors,
      usage: {
        freeGenerationLimit: 1,
        freeGenerationUsed:
          freeGenerationUsed || usingFreeGeneration,
        creditsBefore,
        creditsAfter,
        allowedImages,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Generation failed";

    console.error("IMAGE GENERATOR ERROR:", error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
