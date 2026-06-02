/**
 * POST/GET /api/internal/validate-actions
 * Protected action smoke validation — server-only, no secrets in responses.
 */

import { NextResponse } from "next/server";
import { runActionSmokeTests } from "@/app/lib/validation/action-smoke-tests";
import {
  unauthorizedValidationResponse,
  verifyInternalValidationSecret,
} from "@/app/lib/validation/internal-auth";
import type { ActionSmokeTestOptions } from "@/app/lib/validation/types";

export const runtime = "nodejs";

type ValidateActionsBody = {
  includeInactive?: boolean;
};

function parseOptions(req: Request, body: ValidateActionsBody = {}): ActionSmokeTestOptions {
  const url = new URL(req.url);
  const includeInactive =
    body.includeInactive === true ||
    url.searchParams.get("includeInactive") === "true";

  return { includeInactive };
}

async function handleValidateActions(req: Request) {
  if (!verifyInternalValidationSecret(req)) {
    return unauthorizedValidationResponse();
  }

  let body: ValidateActionsBody = {};
  if (req.method === "POST") {
    try {
      body = (await req.json()) as ValidateActionsBody;
    } catch {
      body = {};
    }
  }

  const options = parseOptions(req, body);
  const summary = runActionSmokeTests(options);

  return NextResponse.json(summary, {
    status: summary.ok ? 200 : 422,
  });
}

export async function GET(req: Request) {
  return handleValidateActions(req);
}

export async function POST(req: Request) {
  return handleValidateActions(req);
}
