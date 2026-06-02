/**
 * POST/GET /api/internal/smoke-test-tools
 * Protected creator tool smoke validation — server-only, no secrets in responses.
 */

import { NextResponse } from "next/server";
import { runToolSmokeTests } from "@/app/lib/validation/tool-smoke-tests";
import {
  isRealProviderSmokeTestsEnabled,
  isTrainingSmokeTestAllowed,
  unauthorizedValidationResponse,
  verifyInternalSmokeTestAccess,
} from "@/app/lib/validation/internal-auth";
import type { ToolSmokeTestOptions } from "@/app/lib/validation/types";

export const runtime = "nodejs";
export const maxDuration = 300;

type SmokeTestToolsBody = {
  runRealProviderTests?: boolean;
  allowTrainingTests?: boolean;
  includeBlocked?: boolean;
  toolIds?: string[];
};

function parseOptions(req: Request, body: SmokeTestToolsBody = {}): ToolSmokeTestOptions {
  const url = new URL(req.url);

  const runRealProviderTests =
    body.runRealProviderTests ??
    (url.searchParams.get("runRealProviderTests") === "true"
      ? true
      : url.searchParams.get("runRealProviderTests") === "false"
        ? false
        : undefined);

  const allowTrainingTests =
    body.allowTrainingTests ??
    (url.searchParams.get("allowTrainingTests") === "true"
      ? true
      : url.searchParams.get("allowTrainingTests") === "false"
        ? false
        : undefined);

  const toolIdsParam = url.searchParams.get("toolIds");
  const toolIds =
    body.toolIds ??
    (toolIdsParam ? toolIdsParam.split(",").map((id) => id.trim()).filter(Boolean) : undefined);

  return {
    runRealProviderTests: isRealProviderSmokeTestsEnabled(runRealProviderTests),
    allowTrainingTests: isTrainingSmokeTestAllowed(allowTrainingTests),
    includeBlocked: body.includeBlocked === true || url.searchParams.get("includeBlocked") === "true",
    toolIds,
  };
}

async function handleSmokeTestTools(req: Request) {
  if (!(await verifyInternalSmokeTestAccess(req))) {
    return unauthorizedValidationResponse();
  }

  let body: SmokeTestToolsBody = {};
  if (req.method === "POST") {
    try {
      body = (await req.json()) as SmokeTestToolsBody;
    } catch {
      body = {};
    }
  }

  const options = parseOptions(req, body);
  const summary = await runToolSmokeTests(options);

  return NextResponse.json(summary, {
    status: summary.ok ? 200 : 422,
  });
}

export async function GET(req: Request) {
  return handleSmokeTestTools(req);
}

export async function POST(req: Request) {
  return handleSmokeTestTools(req);
}
