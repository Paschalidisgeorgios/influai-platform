import { NextResponse } from "next/server";
import { isKreaTrainLoRARouteEnabled } from "@/lib/ai/krea-style-profiles";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Krea LoRA / style training — separate from /api/krea/image/generate.
 * Stub until ENABLE_KREA_TRAIN_LORA=true and provider wiring is complete.
 * Never debits credits or writes to generations in stub mode.
 */
export async function POST() {
  if (!isKreaTrainLoRARouteEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: "Style training is being connected.",
        code: "TRAIN_LORA_NOT_CONNECTED",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: "Style training provider wiring is not complete.",
      code: "TRAIN_LORA_NOT_IMPLEMENTED",
    },
    { status: 503 }
  );
}
