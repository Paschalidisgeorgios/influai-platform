import { NextResponse } from "next/server";
import {
  countRegistryModels,
  runKreaModelValidation,
  type ValidationMode,
  type ValidationToolFilter,
} from "@/lib/ai/krea-model-validation";

export const runtime = "nodejs";
export const maxDuration = 300;

function verifyAdminSecret(req: Request): boolean {
  const provided = req.headers.get("x-admin-secret")?.trim();
  if (!provided) return false;
  const expected =
    process.env.ADMIN_DEV_SECRET?.trim() ||
    process.env.GENERATION_WORKER_SECRET?.trim();
  return Boolean(expected && provided === expected);
}

type RequestBody = {
  tool?: ValidationToolFilter;
  modelIds?: string[];
  mode?: ValidationMode;
  maxModels?: number;
};

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        error: "Model validation is disabled in production.",
      },
      { status: 403 }
    );
  }

  if (!verifyAdminSecret(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    body = {};
  }

  const mode = body.mode === "live_test" ? "live_test" : "dry_run";

  if (mode === "live_test" && !process.env.KREA_API_KEY?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "KREA_API_KEY is not configured — live_test unavailable.",
      },
      { status: 503 }
    );
  }

  try {
    const summary = await runKreaModelValidation({
      tool: body.tool,
      modelIds: body.modelIds,
      mode,
      maxModels: body.maxModels,
    });

    return NextResponse.json({
      ...summary,
      registryStats: countRegistryModels(),
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Validation run failed.";
    console.error("[krea-validate-models]", { message: message.slice(0, 200) });
    return NextResponse.json(
      { success: false, error: message.slice(0, 400) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
