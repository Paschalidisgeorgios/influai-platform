/** Campaign upgrade actions — Krea-only handlers (CampaignExpansionEngine). */
import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import {
  getUpgradeCost,
  isValidUpgradeAction,
  KREA_UPGRADE_NOT_IMPLEMENTED,
  type CampaignUpgradeAction,
} from "@/lib/intelligence/campaign-upgrade-config";

export const runtime = "nodejs";

const LOG_PREFIX = "[campaign-upgrade]";

function log(step: string, extra?: Record<string, unknown>) {
  console.info(LOG_PREFIX, { step, ...extra });
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const { supabase, user, error: authError } = await authenticateBearerUser(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHENTICATED",
          error: "Unauthorized.",
          requestId,
        },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, code: "BODY_INVALID", error: "Invalid request body.", requestId },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, code: "BODY_INVALID", error: "Invalid request body.", requestId },
        { status: 400 }
      );
    }

    const record = body as Record<string, unknown>;
    const mode = typeof record.mode === "string" ? record.mode : "upgrade_action";
    if (mode !== "upgrade_action") {
      return NextResponse.json(
        { success: false, code: "INVALID_MODE", error: "Unsupported mode.", requestId },
        { status: 400 }
      );
    }

    const upgradeAction = record.upgradeAction;
    if (!isValidUpgradeAction(upgradeAction)) {
      return NextResponse.json(
        { success: false, code: "INVALID_UPGRADE", error: "Invalid upgrade action.", requestId },
        { status: 400 }
      );
    }

    const cost = getUpgradeCost(upgradeAction);
    const { data: creditRow, error: creditReadError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditReadError) {
      return NextResponse.json(
        {
          success: false,
          code: "CREDIT_QUERY_FAILED",
          error: "Credit check failed.",
          requestId,
        },
        { status: 500 }
      );
    }

    const creditsAvailable = creditRow?.credits ?? 0;
    if (creditsAvailable < cost) {
      return NextResponse.json(
        {
          success: false,
          code: "INSUFFICIENT_CREDITS",
          error: "Not enough credits.",
          requiredCredits: cost,
          creditsAvailable,
          requestId,
        },
        { status: 402 }
      );
    }

    if (KREA_UPGRADE_NOT_IMPLEMENTED.includes(upgradeAction as CampaignUpgradeAction)) {
      log("not_implemented", { upgradeAction, userId: user.id });
      return NextResponse.json(
        {
          success: false,
          code: "KREA_TOOL_NOT_IMPLEMENTED",
          error: "This engine is being connected. No credits were charged.",
          upgradeAction,
          requestId,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: "KREA_TOOL_NOT_IMPLEMENTED",
        error: "This engine is being connected. No credits were charged.",
        requestId,
      },
      { status: 503 }
    );
  } catch (error) {
    log("error", {
      message: error instanceof Error ? error.message : "unknown",
      requestId,
    });
    return NextResponse.json(
      {
        success: false,
        code: "UNKNOWN_SERVER_ERROR",
        error: "Upgrade failed.",
        requestId,
      },
      { status: 500 }
    );
  }
}
