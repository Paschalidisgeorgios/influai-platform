// LEGACY: Character LoRA training used fal.ai — disabled on Krea-only platform.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      error: "Character training is not available.",
      disabled: true,
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Character training is not available.",
      disabled: true,
    },
    { status: 410 }
  );
}
