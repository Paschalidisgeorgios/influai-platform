/**
 * POST /api/krea/generate
 * Disabled at launch — must not bypass creator tool gates or credit validation.
 * Use /api/generate (unified) or /api/krea/image/generate instead.
 */

import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { getToolRunBlockedUserMessage } from "@/app/lib/tools/assert-tool-can-run";

export const runtime = "nodejs";
export const maxDuration = 300;

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
