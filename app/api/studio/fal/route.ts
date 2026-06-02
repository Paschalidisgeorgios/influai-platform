/**
 * POST /api/studio/fal
 * Disabled at launch — direct fal proxy must not bypass creator tool gates.
 */

import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { getToolRunBlockedUserMessage } from "@/app/lib/tools/assert-tool-can-run";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(req: Request) {
  const language =
    req.headers.get("accept-language")?.toLowerCase().startsWith("de") ? "de" : "en";

  const { user, error: authError } = await authenticateBearerUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: authError ?? "Unauthorized." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: getToolRunBlockedUserMessage(language),
      code: "TOOL_NOT_RUNNABLE",
    },
    { status: 403 }
  );
}
