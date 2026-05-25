import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const IMAGE_GENERATION_COST = 1;

type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";

type OutputFormat = {
  key: string;
  platform: string;
  label: string;
  aspectRatio: string;
  imageSize: ImageSize;
  width: number;
  height: number;
};

type CharacterRecord = {
  id: string;
  name: string;
  description: string | null;
  appearance_prompt: string | null;
  style_prompt: string | null;
  reference_image_url: string | null;
};

const OUTPUT_FORMATS: Record<string, OutputFormat> = {
  square: {
    key: "square",
    platform: "general",
    label: "Square",
    aspectRatio: "1:1",
    imageSize: "1024x1024",
    width: 1024,
    height: 1024,
  },
  tiktok: {
    key: "tiktok",
    platform: "tiktok",
    label: "TikTok / Reels",
    aspectRatio: "9:16",
    imageSize: "1024x1536",
    width: 1024,
    height: 1536,
  },
  instagram_post: {
    key: "instagram_post",
    platform: "instagram",
    label: "Instagram Post",
    aspectRatio: "4:5",
    imageSize: "1024x1536",
    width: 1024,
    height: 1536,
  },
  instagram_story: {
    key: "instagram_story",
    platform: "instagram",
    label: "Instagram Story",
    aspectRatio: "9:16",
    imageSize: "1024x1536",
    width: 1024,
    height: 1536,
  },
  youtube_thumbnail: {
    key: "youtube_thumbnail",
    platform: "youtube",
    label: "YouTube Thumbnail",
    aspectRatio: "16:9",
    imageSize: "1536x1024",
    width: 1536,
    height: 1024,
  },
  youtube_shorts: {
    key: "youtube_shorts",
    platform: "youtube",
    label: "YouTube Shorts",
    aspectRatio: "9:16",
    imageSize: "1024x1536",
    width: 1024,
    height: 1536,
  },
};

function getOutputFormat(formatKey: unknown): OutputFormat {
  if (typeof formatKey !== "string") {
    return OUTPUT_FORMATS.square;
  }

  return OUTPUT_FORMATS[formatKey] ?? OUTPUT_FORMATS.square;
}

function buildFormatRules(outputFormat: OutputFormat) {
  if (
    outputFormat.key === "tiktok" ||
    outputFormat.key === "instagram_story" ||
    outputFormat.key === "youtube_shorts"
  ) {
    return `
Output format:
${outputFormat.label}

Aspect ratio:
${outputFormat.aspectRatio}

Composition rules:
Create a vertical social-media-ready image. Keep the main subject centered but not too close to the edges. Leave clean negative space near the top and bottom for platform UI, captions, buttons, and overlays. Make it feel like a premium mobile campaign visual.
    `.trim();
  }

  if (outputFormat.key === "youtube_thumbnail") {
    return `
Output format:
${outputFormat.label}

Aspect ratio:
${outputFormat.aspectRatio}

Composition rules:
Create a wide cinematic thumbnail composition. Use a strong focal subject, clear visual hierarchy, high contrast, readable framing, and enough negative space for future title text. Make the image attention-grabbing without adding actual text.
    `.trim();
  }

  if (outputFormat.key === "instagram_post") {
    return `
Output format:
${outputFormat.label}

Aspect ratio:
${outputFormat.aspectRatio}

Composition rules:
Create a premium portrait-feed composition. Keep the subject well-framed for Instagram, with clean spacing, strong visual focus, and a polished editorial look.
    `.trim();
  }

  return `
Output format:
${outputFormat.label}

Aspect ratio:
${outputFormat.aspectRatio}

Composition rules:
Create a clean square composition with strong subject focus, balanced spacing, premium lighting, and a polished social-media-ready layout.
  `.trim();
}

function buildQualityRules() {
  return `
Quality rules:
- premium editorial photography
- realistic skin texture
- natural anatomy
- sharp facial detail
- professional lighting
- clean background
- high-end commercial visual quality
- no text, no watermark, no logo
- no distorted face
- no plastic skin
- no extra fingers
- no deformed hands
- no blurry low-quality output
  `.trim();
}

function buildStandardFinalPrompt({
  prompt,
  outputFormat,
}: {
  prompt: string;
  outputFormat: OutputFormat;
}) {
  return `
Create a premium AI-generated visual based on this request:

User request:
${prompt}

${buildFormatRules(outputFormat)}

${buildQualityRules()}

Style direction:
Make the image feel like a professional campaign asset for a modern creator brand. Prioritize realism, composition, lighting, elegance, and strong social-media impact.
  `.trim();
}

function buildCharacterStylePrompt({
  character,
  prompt,
  outputFormat,
}: {
  character: CharacterRecord;
  prompt: string;
  outputFormat: OutputFormat;
}) {
  return `
Create a premium AI-generated visual inspired by this saved character profile.

Important:
Use this character as creative direction for look, styling, personality, hair, outfit direction, and overall brand identity. Do not promise exact face identity. This is Character Style mode, not strict face consistency.

Character name:
${character.name}

Character description:
${character.description ?? "No additional description."}

Character appearance direction:
${character.appearance_prompt ?? "No specific appearance prompt."}

Character style direction:
${character.style_prompt ?? "No specific style prompt."}

User scene request:
${prompt}

${buildFormatRules(outputFormat)}

${buildQualityRules()}

Style direction:
Create a polished creator-campaign visual that feels consistent with the character's brand and aesthetic. Prioritize professional composition, realistic detail, strong lighting, and commercial usability.
  `.trim();
}

async function refundCredits(userId: string) {
  const { error } = await supabaseAdmin.rpc("refund_user_credits", {
    target_user_id: userId,
    credits_to_refund: IMAGE_GENERATION_COST,
  });

  if (error) {
    console.error("Credit refund error:", error);
  }

  const { error: transactionError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: IMAGE_GENERATION_COST,
      type: "refund",
      source: "generation_job_create_failure",
    });

  if (transactionError) {
    console.error("Refund transaction log error:", transactionError);
  }
}

async function triggerWorker(generationId: string, origin: string) {
  const response = await fetch(`${origin}/api/generate/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-worker-secret": process.env.GENERATION_WORKER_SECRET!,
    },
    body: JSON.stringify({
      generationId,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Worker trigger failed:", {
      status: response.status,
      body: text,
    });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const prompt = body.prompt;
    const characterId = body.characterId ?? null;
    const outputFormat = getOutputFormat(body.outputFormat);

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let finalPrompt = buildStandardFinalPrompt({
      prompt,
      outputFormat,
    });

    let usedCharacterId: string | null = null;
    let referenceImageUrl: string | null = null;

    if (characterId && typeof characterId === "string") {
      const { data: character, error: characterError } = await supabaseAdmin
        .from("ai_characters")
        .select(
          `
          id,
          name,
          description,
          appearance_prompt,
          style_prompt,
          reference_image_url
        `
        )
        .eq("id", characterId)
        .eq("user_id", user.id)
        .single();

      if (characterError || !character) {
        return NextResponse.json(
          { error: "Character not found" },
          { status: 404 }
        );
      }

      usedCharacterId = character.id;
      referenceImageUrl = character.reference_image_url ?? null;

      finalPrompt = buildCharacterStylePrompt({
        character,
        prompt,
        outputFormat,
      });
    }

    const { data: creditSuccess, error: creditError } =
      await supabaseAdmin.rpc("consume_user_credits", {
        target_user_id: user.id,
        credits_to_consume: IMAGE_GENERATION_COST,
      });

    if (creditError) {
      console.error("Credit consume error:", creditError);

      return NextResponse.json(
        { error: "Credit check failed" },
        { status: 500 }
      );
    }

    if (!creditSuccess) {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 402 }
      );
    }

    const { data: generation, error: generationCreateError } =
      await supabaseAdmin
        .from("generations")
        .insert({
          user_id: user.id,
          prompt,
          final_prompt: finalPrompt,
          image_url: null,
          status: "processing",
          provider: "openai",
          model: "gpt-image-1",
          workflow: "standard",
          reference_image_url: referenceImageUrl,
          social_platform: outputFormat.platform,
          output_format: outputFormat.label,
          image_size: outputFormat.imageSize,
          output_width: outputFormat.width,
          output_height: outputFormat.height,
          credits_used: IMAGE_GENERATION_COST,
          character_id: usedCharacterId,
          error_message: null,
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

    if (generationCreateError || !generation) {
      console.error(
        "Generation create error:",
        JSON.stringify(generationCreateError, null, 2)
      );

      await refundCredits(user.id);

      return NextResponse.json(
        { error: "Failed to create generation job. Credits refunded." },
        { status: 500 }
      );
    }

    const { error: transactionError } = await supabaseAdmin
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        amount: -IMAGE_GENERATION_COST,
        type: "usage",
        source: usedCharacterId
          ? `${outputFormat.platform}_character_style_generation_job`
          : `${outputFormat.platform}_standard_generation_job`,
      });

    if (transactionError) {
      console.error("Credit transaction log error:", transactionError);
    }

    const origin =
      req.headers.get("origin") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      new URL(req.url).origin;

    try {
      await triggerWorker(generation.id, origin);
    } catch (error) {
      console.error("Worker trigger exception:", error);
    }

    return NextResponse.json({
      success: true,
      queued: true,
      generationId: generation.id,
      creditsUsed: IMAGE_GENERATION_COST,
      characterId: usedCharacterId,
      workflow: "standard",
      referenceImageUrl,
      outputFormat,
    });
  } catch (error) {
    console.error(
      "Generate route error:",
      error instanceof Error ? error.message : JSON.stringify(error, null, 2)
    );

    return NextResponse.json(
      { error: "Failed to create generation job." },
      { status: 500 }
    );
  }
}