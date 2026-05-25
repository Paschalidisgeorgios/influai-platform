import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fal } from "@fal-ai/client";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FAL_TRAINING_MODEL = "fal-ai/flux-lora-portrait-trainer";

fal.config({
  credentials: process.env.FAL_KEY!,
});

async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return {
      user: null,
      error: "Missing authorization header",
    };
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      error: "Unauthorized",
    };
  }

  return {
    user,
    error: null,
  };
}

function getFileUrl(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "url" in value &&
    typeof value.url === "string"
  ) {
    return value.url;
  }

  return null;
}

function normalizeFalStatus(value: unknown) {
  if (typeof value !== "string") {
    return "UNKNOWN";
  }

  return value;
}

function isFalFailureStatus(status: string) {
  return (
    status === "FAILED" ||
    status === "CANCELLED" ||
    status === "ERROR" ||
    status === "FAILED_WITH_ERROR"
  );
}

export async function GET(req: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "Missing FAL_KEY environment variable." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("characterId");

    if (!characterId) {
      return NextResponse.json(
        { error: "characterId is required" },
        { status: 400 }
      );
    }

    const { data: character, error: characterError } = await supabaseAdmin
      .from("ai_characters")
      .select(
        `
        id,
        user_id,
        training_status,
        training_provider,
        training_model,
        trained_model_url,
        trained_model_version,
        trained_trigger_word,
        training_error
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

    const { data: trainingJob, error: jobError } = await supabaseAdmin
      .from("ai_character_training_jobs")
      .select(
        `
        id,
        provider,
        provider_job_id,
        status,
        trigger_word,
        model_url,
        model_version,
        error_message,
        created_at,
        started_at,
        completed_at
      `
      )
      .eq("user_id", user.id)
      .eq("character_id", characterId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (jobError) {
      console.error("Training job fetch error:", jobError);

      return NextResponse.json(
        { error: "Failed to fetch training job." },
        { status: 500 }
      );
    }

    if (!trainingJob || !trainingJob.provider_job_id) {
      return NextResponse.json({
        success: true,
        character,
        trainingJob: trainingJob ?? null,
      });
    }

    if (
      trainingJob.status === "completed" ||
      trainingJob.status === "failed"
    ) {
      return NextResponse.json({
        success: true,
        character,
        trainingJob,
      });
    }

    const queueStatus = await fal.queue.status(FAL_TRAINING_MODEL, {
      requestId: trainingJob.provider_job_id,
      logs: true,
    });

    const falStatus = normalizeFalStatus(queueStatus.status);

    if (falStatus === "COMPLETED") {
      const result = await fal.queue.result(FAL_TRAINING_MODEL, {
        requestId: trainingJob.provider_job_id,
      });

      const resultData = result.data as {
        diffusers_lora_file?: unknown;
        config_file?: unknown;
      };

      const loraUrl = getFileUrl(resultData.diffusers_lora_file);
      const configUrl = getFileUrl(resultData.config_file);

      if (!loraUrl) {
        const errorMessage = "Training completed but no LoRA file was returned.";
        const now = new Date().toISOString();

        await supabaseAdmin
          .from("ai_character_training_jobs")
          .update({
            status: "failed",
            error_message: errorMessage,
            completed_at: now,
          })
          .eq("id", trainingJob.id)
          .eq("user_id", user.id);

        await supabaseAdmin
          .from("ai_characters")
          .update({
            training_status: "failed",
            training_error: errorMessage,
            updated_at: now,
          })
          .eq("id", characterId)
          .eq("user_id", user.id);

        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }

      const now = new Date().toISOString();

      const { error: updateJobError } = await supabaseAdmin
        .from("ai_character_training_jobs")
        .update({
          status: "completed",
          model_url: loraUrl,
          model_version: configUrl,
          completed_at: now,
          error_message: null,
        })
        .eq("id", trainingJob.id)
        .eq("user_id", user.id);

      if (updateJobError) {
        console.error("Training job completion update error:", updateJobError);
      }

      const { error: updateCharacterError } = await supabaseAdmin
        .from("ai_characters")
        .update({
          training_status: "completed",
          training_provider: "fal",
          training_model: FAL_TRAINING_MODEL,
          trained_model_url: loraUrl,
          trained_model_version: configUrl,
          trained_trigger_word:
            trainingJob.trigger_word ?? character.trained_trigger_word,
          training_completed_at: now,
          training_error: null,
          updated_at: now,
        })
        .eq("id", characterId)
        .eq("user_id", user.id);

      if (updateCharacterError) {
        console.error(
          "Character training completion update error:",
          updateCharacterError
        );
      }

      const { data: updatedCharacter } = await supabaseAdmin
        .from("ai_characters")
        .select(
          `
          id,
          user_id,
          training_status,
          training_provider,
          training_model,
          trained_model_url,
          trained_model_version,
          trained_trigger_word,
          training_error
        `
        )
        .eq("id", characterId)
        .eq("user_id", user.id)
        .single();

      return NextResponse.json({
        success: true,
        character: updatedCharacter ?? character,
        trainingJob: {
          ...trainingJob,
          status: "completed",
          model_url: loraUrl,
          model_version: configUrl,
          completed_at: now,
          error_message: null,
        },
        falStatus,
      });
    }

    if (isFalFailureStatus(falStatus)) {
      const errorMessage = `Training ${falStatus.toLowerCase()}.`;
      const now = new Date().toISOString();

      await supabaseAdmin
        .from("ai_character_training_jobs")
        .update({
          status: "failed",
          error_message: errorMessage,
          completed_at: now,
        })
        .eq("id", trainingJob.id)
        .eq("user_id", user.id);

      await supabaseAdmin
        .from("ai_characters")
        .update({
          training_status: "failed",
          training_error: errorMessage,
          updated_at: now,
        })
        .eq("id", characterId)
        .eq("user_id", user.id);

      return NextResponse.json({
        success: true,
        character: {
          ...character,
          training_status: "failed",
          training_error: errorMessage,
        },
        trainingJob: {
          ...trainingJob,
          status: "failed",
          error_message: errorMessage,
          completed_at: now,
        },
        falStatus,
      });
    }

    return NextResponse.json({
      success: true,
      character,
      trainingJob: {
        ...trainingJob,
        status: "training",
      },
      falStatus,
    });
  } catch (error) {
    console.error("Training status route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch training status.",
      },
      { status: 500 }
    );
  }
}