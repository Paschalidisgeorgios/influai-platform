/**
 * POST/GET /api/internal/validate-engines
 * Protected engine smoke validation — server-only, no secrets in responses.
 */

import { NextResponse } from "next/server";
import { runEngineSmokeTests } from "@/app/lib/validation/engine-smoke-tests";
import {
  isRealProviderSmokeTestsEnabled,
  unauthorizedValidationResponse,
  verifyInternalValidationSecret,
} from "@/app/lib/validation/internal-auth";
import type { EngineSmokeTestOptions } from "@/app/lib/validation/types";

export const runtime = "nodejs";
export const maxDuration = 300;

type ValidateEnginesBody = {
  includeInactive?: boolean;
  runRealProviderTests?: boolean;
};

function parseOptions(req: Request, body: ValidateEnginesBody = {}): EngineSmokeTestOptions {
  const url = new URL(req.url);
  const includeInactive =
    body.includeInactive === true ||
    url.searchParams.get("includeInactive") === "true";
  const runRealProviderTests =
    body.runRealProviderTests ??
    (url.searchParams.get("runRealProviderTests") === "true"
      ? true
      : url.searchParams.get("runRealProviderTests") === "false"
        ? false
        : undefined);

  return {
    includeInactive,
    runRealProviderTests: isRealProviderSmokeTestsEnabled(runRealProviderTests),
  };
}

async function handleValidateEngines(req: Request) {
  if (!verifyInternalValidationSecret(req)) {
    return unauthorizedValidationResponse();
  }

  let body: ValidateEnginesBody = {};
  if (req.method === "POST") {
    try {
      body = (await req.json()) as ValidateEnginesBody;
    } catch {
      body = {};
    }
  }

  const options = parseOptions(req, body);
  const summary = await runEngineSmokeTests(options);

  return NextResponse.json(summary, {
    status: summary.ok ? 200 : 422,
  });
}

export async function GET(req: Request) {
  return handleValidateEngines(req);
}

export async function POST(req: Request) {
  return handleValidateEngines(req);
}
