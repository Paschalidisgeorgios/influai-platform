/**
 * Multi-provider admin model validation — dev only.
 * POST /api/admin/ai/validate-models
 *
 * No user credits, no generations insert, FAL_KEY/KREA_API_KEY server-side only.
 */
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  countEngineRegistryStats,
  runEngineModelValidation,
  type ValidationMode,
  type ValidationToolFilter,
} from "@/lib/ai/engine-model-validation";
import { parseValidationToolFilter } from "@/lib/ai/krea-model-validation";
import type { AIProvider } from "@/lib/ai/model-registry";
import { isFalKeyConfigured } from "@/lib/fal/fal-client";
import { isFalProviderEnabled } from "@/lib/providers/flags";

export const runtime = "nodejs";
export const maxDuration = 300;

type ValidateModelsRequestBody = {
  mode?: ValidationMode;
  provider?: AIProvider;
  tool?: ValidationToolFilter;
  modelIds?: string[];
  maxModels?: number;
};

function verifyAdminSecret(req: Request): boolean {
  const provided = req.headers.get("x-admin-secret")?.trim();
  if (!provided) return false;
  const expected =
    process.env.ADMIN_DEV_SECRET?.trim() ||
    process.env.GENERATION_WORKER_SECRET?.trim();
  return Boolean(expected && provided === expected);
}

function parseProvider(raw: unknown): AIProvider | undefined {
  if (raw === "krea" || raw === "fal") return raw;
  return undefined;
}

function parseModelIds(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const ids = raw
    .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    .map((id) => id.trim());
  return ids.length ? ids : undefined;
}

function isFalLiveTest(params: {
  provider?: AIProvider;
  modelIds?: string[];
}): boolean {
  if (params.provider === "fal") return true;
  if (params.modelIds?.length && params.modelIds.every((id) => id.startsWith("fal_"))) {
    return true;
  }
  return false;
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Model validation is disabled in production." },
      { status: 403 }
    );
  }

  if (!verifyAdminSecret(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: ValidateModelsRequestBody = {};
  try {
    body = (await req.json()) as ValidateModelsRequestBody;
  } catch {
    body = {};
  }

  const url = new URL(req.url);
  const provider =
    parseProvider(body.provider) ?? parseProvider(url.searchParams.get("provider"));
  const tool =
    parseValidationToolFilter(body.tool) ??
    parseValidationToolFilter(url.searchParams.get("tool"));
  const mode: ValidationMode = body.mode === "live_test" ? "live_test" : "dry_run";
  const modelIds = parseModelIds(body.modelIds);
  const maxModels =
    typeof body.maxModels === "number" && body.maxModels > 0
      ? body.maxModels
      : undefined;

  if (mode === "live_test") {
    if (isFalLiveTest({ provider, modelIds })) {
      if (!isFalProviderEnabled() || !isFalKeyConfigured()) {
        return NextResponse.json(
          {
            success: false,
            error: "FAL_KEY is not configured — live_test unavailable.",
            code: "MISSING_FAL_KEY",
          },
          { status: 503 }
        );
      }
    } else if (!process.env.KREA_API_KEY?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "KREA_API_KEY is not configured — live_test unavailable.",
          code: "MISSING_KREA_API_KEY",
        },
        { status: 503 }
      );
    }
  }

  try {
    const summary = await runEngineModelValidation({
      provider,
      tool,
      modelIds,
      mode,
      maxModels: maxModels ?? (mode === "live_test" ? 3 : undefined),
    });

    const responseBody: Record<string, unknown> = {
      ...summary,
      filter: {
        provider: provider ?? null,
        tool: tool ?? null,
        modelIds: modelIds ?? null,
        maxModels: maxModels ?? null,
      },
      checkedAt: new Date().toISOString(),
    };

    if (!tool && !modelIds) {
      responseBody.registryStats = countEngineRegistryStats();
    }

    if (process.env.NODE_ENV === "development") {
      try {
        const reportDir = path.join(process.cwd(), "tmp");
        await mkdir(reportDir, { recursive: true });
        await writeFile(
          path.join(reportDir, "engine-model-validation-report.json"),
          JSON.stringify(responseBody, null, 2),
          "utf8"
        );
      } catch {
        /* non-fatal */
      }
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation run failed.";
    console.error("[admin/ai/validate-models]", { message: message.slice(0, 200) });
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
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  return POST(
    new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({
        provider: parseProvider(url.searchParams.get("provider")),
        tool: parseValidationToolFilter(url.searchParams.get("tool")),
        mode: url.searchParams.get("mode") === "live_test" ? "live_test" : "dry_run",
      }),
    })
  );
}
