import { NextRequest, NextResponse } from "next/server";

import Replicate from "replicate";

import {
  authenticateBearerUser,
} from "../../lib/supabase-admin";

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

async function extractUrlFromItem(
  item: unknown
): Promise<string | null> {
  if (item == null) return null;

  if (typeof item === "string") {
    const trimmed = item.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (item instanceof URL) {
    return item.href;
  }

  if (typeof item === "object") {
    const record = item as Record<string, unknown>;

    if (typeof record.url === "string") {
      const trimmed = record.url.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    if (typeof record.href === "string") {
      const trimmed = record.href.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    if (typeof record.url === "function") {
      try {
        const result = await Promise.resolve(
          (record.url as () => unknown)()
        );
        return extractUrlFromItem(result);
      } catch {
        return null;
      }
    }
  }

  return null;
}

async function normalizeReplicateOutput(
  output: unknown
): Promise<string[]> {
  if (output == null) return [];

  const items = Array.isArray(output)
    ? output
    : [output];

  const urls: string[] = [];

  for (const item of items) {
    const url = await extractUrlFromItem(item);

    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls;
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
    const freeAlreadyUsed = priorGenerations >= 1;

    let allowedImages = 0;
    let usingFreeImage = false;

    if (creditsBefore > 0) {
      allowedImages = Math.min(4, creditsBefore);
    } else if (priorGenerations === 0) {
      allowedImages = 1;
      usingFreeImage = true;
    } else {
      return NextResponse.json(
        {
          error: "Payment required",
          paymentRequired: true,
          freeUsed: true,
          credits: 0,
        },
        { status: 402 }
      );
    }

    if (allowedImages <= 0) {
      return NextResponse.json(
        {
          error: "Payment required",
          paymentRequired: true,
          freeUsed: freeAlreadyUsed,
          credits: creditsBefore,
        },
        { status: 402 }
      );
    }

    console.log(
      `Image generation started for user ${user.id} (${allowedImages} image(s))`
    );

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

    const allImages = await normalizeReplicateOutput(
      output
    );

    const images = allImages.slice(0, allowedImages);

    if (images.length === 0) {
      return NextResponse.json(
        { error: "No images returned from Replicate" },
        { status: 500 }
      );
    }

    let savedCount = 0;
    const dbErrors: DbErrorEntry[] = [];

    for (const imageUrl of images) {
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

    if (!usingFreeImage && savedCount > 0) {
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
      `Generated ${images.length} images, saved ${savedCount}, credits ${creditsBefore} -> ${creditsAfter}`
    );

    return NextResponse.json({
      success: true,
      images,
      savedCount,
      dbErrors,
      usage: {
        freeLimit: 1,
        freeUsed: freeAlreadyUsed || usingFreeImage,
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
