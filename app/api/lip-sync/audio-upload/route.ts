// LEGACY: fal.ai lip sync audio upload — not used by the new dashboard.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Lip sync is not available." },
    { status: 410 }
  );
}
