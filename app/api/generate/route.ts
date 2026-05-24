import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const IMAGE_GENERATION_COST = 1;

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
  try {
    await fetch(`${origin}/api/generate/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-worker-secret": process.env.GENERATION_WORKER_SECRET!,
      },
      body: JSON.stringify({
        generationId,
      }),
    });
  } catch (error) {
    console.error("Worker trigger error:", error);
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
    const requestedWorkflow = body.workflow ?? "standard";

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let finalPrompt = prompt;
    let usedCharacterId: string | null = null;
    let workflow = "standard";
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
          reference_image_url,
          face_workflow
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

      workflow =
        requestedWorkflow === "face_consistent"
          ? "face_consistent"
          : character.face_workflow ?? "standard";

      if (workflow === "openai") {
        workflow = "standard";
      }

      finalPrompt = `
Create an image of this saved AI character.

Character name:
${character.name}

Character description:
${character.description ?? "No additional description."}

Character appearance:
${character.appearance_prompt ?? "No specific appearance prompt."}

Character style:
${character.style_prompt ?? "No specific style prompt."}

Scene prompt:
${prompt}

Keep the character visually consistent. Preserve face, age, body type, hair, styling direction, and overall identity across generations.
      `.trim();
    } else {
      workflow =
        requestedWorkflow === "face_consistent" ? "standard" : requestedWorkflow;
    }

    if (workflow === "face_consistent" && !referenceImageUrl) {
      return NextResponse.json(
        {
          error:
            "Face-consistent generation requires a character reference image.",
        },
        { status: 400 }
      );
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
          provider: workflow === "face_consistent" ? "replicate" : "openai",
          model:
            workflow === "face_consistent"
              ? "face-consistency-workflow"
              : "gpt-image-1",
          workflow,
          reference_image_url: referenceImageUrl,
          credits_used: IMAGE_GENERATION_COST,
          character_id: usedCharacterId,
          error_message: null,
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

    if (generationCreateError || !generation) {
      console.error("Generation create error:", generationCreateError);

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
          ? `${workflow}_character_generation_job`
          : `${workflow}_generation_job`,
      });

    if (transactionError) {
      console.error("Credit transaction log error:", transactionError);
    }

    const origin =
      req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

    if (origin) {
      triggerWorker(generation.id, origin);
    }

    return NextResponse.json({
      success: true,
      queued: true,
      generationId: generation.id,
      creditsUsed: IMAGE_GENERATION_COST,
      characterId: usedCharacterId,
      workflow,
      referenceImageUrl,
    });
  } catch (error) {
    console.error("Generate route error:", error);

    return NextResponse.json(
      { error: "Failed to create generation job." },
      { status: 500 }
    );
  }
}