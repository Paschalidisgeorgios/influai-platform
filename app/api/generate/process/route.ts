import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_BUCKET = "generations";

function base64ToBuffer(base64: string) {
  return Buffer.from(base64, "base64");
}

async function refundCredits(userId: string, creditsToRefund: number) {
  const { error } = await supabaseAdmin.rpc("refund_user_credits", {
    target_user_id: userId,
    credits_to_refund: creditsToRefund,
  });

  if (error) {
    console.error("Worker credit refund error:", error);
  }

  const { error: transactionError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: creditsToRefund,
      type: "refund",
      source: "generation_worker_failure",
    });

  if (transactionError) {
    console.error("Worker refund transaction log error:", transactionError);
  }
}

async function markFailedAndRefund({
  generationId,
  userId,
  creditsUsed,
  errorMessage,
}: {
  generationId: string;
  userId: string;
  creditsUsed: number;
  errorMessage: string;
}) {
  await refundCredits(userId, creditsUsed);

  const { error } = await supabaseAdmin
    .from("generations")
    .update({
      status: "failed",
      error_message: errorMessage,
      credits_used: 0,
      failed_at: new Date().toISOString(),
    })
    .eq("id", generationId);

  if (error) {
    console.error("Worker failed generation update error:", error);
  }
}

async function processOpenAIImage({
  generationId,
  userId,
  finalPrompt,
  model,
  creditsUsed,
}: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  model: string;
  creditsUsed: number;
}) {
  const result = await openai.images.generate({
    model,
    prompt: finalPrompt,
    size: "1024x1024",
    n: 1,
  });

  const imageBase64 = result.data?.[0]?.b64_json;

  if (!imageBase64) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "OpenAI did not return image data.",
    });

    return NextResponse.json(
      { error: "Image generation failed. Credits refunded." },
      { status: 500 }
    );
  }

  const imageBuffer = base64ToBuffer(imageBase64);
  const filePath = `${userId}/${crypto.randomUUID()}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, imageBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (uploadError) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: uploadError.message,
    });

    return NextResponse.json(
      { error: "Image upload failed. Credits refunded." },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

  const { error: updateError } = await supabaseAdmin
    .from("generations")
    .update({
      image_url: publicUrl,
      status: "completed",
      error_message: null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", generationId);

  if (updateError) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: updateError.message,
    });

    return NextResponse.json(
      { error: "Failed to update generation. Credits refunded." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    generationId,
    image: publicUrl,
  });
}

async function processFaceConsistentPlaceholder({
  generationId,
  userId,
  creditsUsed,
}: {
  generationId: string;
  userId: string;
  creditsUsed: number;
}) {
  await markFailedAndRefund({
    generationId,
    userId,
    creditsUsed,
    errorMessage:
      "Face Consistent workflow is prepared but no face-consistency provider is connected yet.",
  });

  return NextResponse.json(
    {
      error:
        "Face Consistent workflow is not connected yet. Credits refunded.",
    },
    { status: 501 }
  );
}

export async function POST(req: Request) {
  try {
    const workerSecret = req.headers.get("x-worker-secret");

    if (workerSecret !== process.env.GENERATION_WORKER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const generationId = body.generationId;

    if (!generationId || typeof generationId !== "string") {
      return NextResponse.json(
        { error: "generationId is required" },
        { status: 400 }
      );
    }

    const { data: generation, error: fetchError } = await supabaseAdmin
      .from("generations")
      .select(
        `
        id,
        user_id,
        prompt,
        final_prompt,
        status,
        provider,
        model,
        workflow,
        reference_image_url,
        credits_used
      `
      )
      .eq("id", generationId)
      .single();

    if (fetchError || !generation) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    if (generation.status !== "processing") {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Generation is not processing",
      });
    }

    const creditsUsed =
      typeof generation.credits_used === "number"
        ? generation.credits_used
        : 1;

    const finalPrompt = generation.final_prompt || generation.prompt;
    const workflow = generation.workflow || "standard";

    if (workflow === "face_consistent") {
      if (!generation.reference_image_url) {
        await markFailedAndRefund({
          generationId,
          userId: generation.user_id,
          creditsUsed,
          errorMessage:
            "Face Consistent workflow requires a reference image.",
        });

        return NextResponse.json(
          {
            error:
              "Face Consistent workflow requires a reference image. Credits refunded.",
          },
          { status: 400 }
        );
      }

      return processFaceConsistentPlaceholder({
        generationId,
        userId: generation.user_id,
        creditsUsed,
      });
    }

    return processOpenAIImage({
      generationId,
      userId: generation.user_id,
      finalPrompt,
      model: generation.model || "gpt-image-1",
      creditsUsed,
    });
  } catch (error) {
    console.error("Generation worker error:", error);

    return NextResponse.json(
      { error: "Generation worker failed" },
      { status: 500 }
    );
  }
}