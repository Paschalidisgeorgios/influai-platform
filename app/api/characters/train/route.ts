import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Character Pro training is temporarily disabled. Characters are currently used as style profiles for reliable standard image generation.",
      disabled: true,
    },
    { status: 403 }
  );
}