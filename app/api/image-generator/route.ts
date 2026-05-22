import { NextRequest, NextResponse } from "next/server";

import Replicate from "replicate";

import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

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

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt,
          num_outputs: 4,
          output_format: "jpg",
          output_quality: 90,
        },
      }
    );

    const images = await normalizeReplicateOutput(
      output
    );

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

    return NextResponse.json({
      success: true,
      images,
      savedCount,
      dbErrors,
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
