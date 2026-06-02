import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  collectValidationCandidates,
  countRegistryModels,
  parseValidationToolFilter,
  runKreaModelValidation,
  type ValidationMode,
  type ValidationToolFilter,
} from "@/lib/ai/krea-model-validation";
import { countKreaRegistryStats } from "@/lib/ai/krea-model-registry";

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

function parseRequestBody(
  req: Request,
  raw: RequestBody
): { tool?: ValidationToolFilter; modelIds?: string[]; mode: ValidationMode; maxModels?: number } {
  const url = new URL(req.url);
  const tool =
    parseValidationToolFilter(raw.tool) ??
    parseValidationToolFilter(url.searchParams.get("tool"));
  const mode = raw.mode === "live_test" ? "live_test" : "dry_run";

  const modelIds = Array.isArray(raw.modelIds)
    ? raw.modelIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    : undefined;

  return {
    tool,
    modelIds: modelIds?.length ? modelIds : undefined,
    mode,
    maxModels: typeof raw.maxModels === "number" ? raw.maxModels : undefined,
  };
}

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

  let raw: RequestBody = {};
  try {
    raw = (await req.json()) as RequestBody;
  } catch {
    raw = {};
  }

  const { tool, modelIds, mode, maxModels } = parseRequestBody(req, raw);

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
    const candidates = collectValidationCandidates(tool, modelIds);

    const summary = await runKreaModelValidation({
      tool,
      modelIds,
      mode,
      maxModels: maxModels ?? (mode === "live_test" ? 3 : undefined),
    });

    const responseBody: Record<string, unknown> = {
      ...summary,
      filter: {
        tool: tool ?? null,
        modelIds: modelIds ?? null,
        candidateCount: candidates.length,
      },
      checkedAt: new Date().toISOString(),
    };

    if (!tool && !modelIds) {
      responseBody.registryStats = countKreaRegistryStats();
      responseBody.legacyStats = countRegistryModels();
    }

    if (process.env.NODE_ENV === "development") {
      try {
        const reportDir = path.join(process.cwd(), "tmp");
        await mkdir(reportDir, { recursive: true });
        await writeFile(
          path.join(reportDir, "krea-model-validation-report.json"),
          JSON.stringify(responseBody, null, 2),
          "utf8"
        );
      } catch (reportError) {
        console.warn("[validate-models] report write skipped:", reportError);
      }
    }

    return NextResponse.json(responseBody);
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
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Model validation is disabled in production." },
      { status: 403 }
    );
  }

  if (!verifyAdminSecret(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const tool = parseValidationToolFilter(url.searchParams.get("tool"));
  const mode = url.searchParams.get("mode") === "live_test" ? "live_test" : "dry_run";

  return POST(
    new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({ tool, mode }),
    })
  );
}
