// LEGACY: old dashboard motion transfer route — not used by the new dashboard.
import { NextResponse } from "next/server";
import { buildGenerationErrorPayload } from "@/lib/generation/generation-errors";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    buildGenerationErrorPayload("KREA_MOTION_NOT_IMPLEMENTED", {
      refunded: false,
    }),
    { status: 410 }
  );
}
