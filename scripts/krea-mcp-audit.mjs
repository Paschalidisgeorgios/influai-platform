/**
 * Audit Krea models via official SDK MCP (list_models + get_model_schema).
 * Usage: npx tsx scripts/krea-mcp-audit.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Krea } from "@krea-ai/sdk";
import { KREA_OFFICIAL_ENDPOINT_RECORDS } from "../lib/krea/krea-official-endpoints.generated.ts";
import { KREA_MODEL_REGISTRY_ENTRIES } from "../lib/ai/krea-model-registry-data.ts";
import { KREA_MODEL_REGISTRY_EXT } from "../lib/ai/krea-model-registry-ext.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const FOCUS = [
  "minimax/hailuo",
  "kling/",
  "runway/",
  "topaz/",
  "bytedance/seededit",
  "google/nano-banana",
  "openai/gpt-image",
  "lipsync",
  "hedra",
  "fabric",
  "wan/",
  "live-avatar",
  "motion",
];

function getInternalModel(entry) {
  return (entry.internalModel ?? entry.model ?? "").replace(/^\/+/, "");
}

async function main() {
  const apiKey = process.env.KREA_API_KEY?.trim();
  if (!apiKey) throw new Error("KREA_API_KEY missing");

  const client = new Krea({ apiKey });
  const models = await client.models.list({});

  const openapiByPath = new Map(
    KREA_OFFICIAL_ENDPOINT_RECORDS.map((e) => [e.modelPath, e])
  );

  const enriched = [];
  for (const model of models) {
    const apiPath = (model.id ?? model.name ?? "").replace(/^\/+/, "");
    const displayName = model.name ?? apiPath;
    let schema = null;
    try {
      schema = await client.models.getSchema(apiPath);
    } catch (e) {
      schema = { error: e instanceof Error ? e.message : String(e) };
    }

    const openapi = openapiByPath.get(apiPath);
    const subscribePath = openapi?.subscribePath ?? schema?.subscribe_path ?? schema?.subscribePath ?? null;
    const category = model.category ?? openapi?.kind ?? schema?.category ?? null;

    const inputSchema = schema?.input_schema ?? schema?.inputSchema ?? schema?.input ?? {};
    const props = inputSchema.properties ?? {};
    const required = inputSchema.required ?? openapi?.requiredFields ?? [];
    const optional = Object.keys(props).filter((k) => !required.includes(k));

    const outputType =
      category === "video" ? "video" : category === "enhance" || category === "image" ? "image" : "unknown";

    enriched.push({
      name: displayName,
      apiPath,
      subscribePath,
      category,
      requiredFields: required,
      optionalFields: optional,
      outputType,
      tokenAccessible: model.metadata?.available ?? model.available ?? null,
      executableViaOpenApi: Boolean(openapi),
      tier: model.metadata?.tier,
      capabilities: model.metadata?.capabilities,
      recommended: model.metadata?.recommended,
      schemaError: schema?.error,
    });
  }

  const registry = [...KREA_MODEL_REGISTRY_ENTRIES, ...KREA_MODEL_REGISTRY_EXT].map((e) => ({
    id: e.id,
    internalModel: getInternalModel(e),
    category: e.category,
    availability: e.availability,
    validation: e.validation,
  }));

  const openapiPaths = new Set(KREA_OFFICIAL_ENDPOINT_RECORDS.map((e) => e.modelPath));
  const mcpPaths = new Set(enriched.map((m) => m.apiPath));

  const comparison = registry.map((r) => {
    const mcp = enriched.find((m) => m.apiPath === r.internalModel);
    const inOpenApi = openapiPaths.has(r.internalModel);
    const inMcp = mcpPaths.has(r.internalModel);
    return {
      registryId: r.id,
      internalModel: r.internalModel,
      registryCategory: r.category,
      availability: r.availability,
      pathCorrect: inOpenApi && inMcp,
      inOpenApi,
      inMcpList: inMcp,
      mcpCategory: mcp?.category ?? null,
      mcpSubscribePath: mcp?.subscribePath ?? null,
    };
  });

  const focusModels = enriched.filter((m) =>
    FOCUS.some((f) => m.apiPath.includes(f) || (m.subscribePath ?? "").includes(f))
  );

  const report = {
    fetchedAt: new Date().toISOString(),
    modelCount: enriched.length,
    rawSample: models.slice(0, 3),
    allModels: enriched,
    focusModels,
    comparison,
    registry,
  };

  const outPath = path.join(root, "tmp/krea-mcp-audit-report.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log("OK", outPath, "models:", enriched.length, "focus:", focusModels.length);
}

main().catch((e) => {
  console.error("FAILED", e instanceof Error ? e.message : e);
  process.exit(1);
});
