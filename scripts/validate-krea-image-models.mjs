/**
 * Dev-only: dry-run + limited live Krea image model validation.
 * Usage: npx tsx scripts/validate-krea-image-models.mjs
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();

async function loadValidation() {
  const mod = await import("../lib/ai/krea-model-validation.ts");
  return mod;
}

async function main() {
  const { runKreaModelValidation, countRegistryModels } = await loadValidation();

  if (!process.env.KREA_API_KEY?.trim()) {
    console.warn("[validate] KREA_API_KEY missing — live_test will be skipped.");
  }

  console.log("\n=== DRY RUN — all image models ===\n");
  const dryRun = await runKreaModelValidation({
    tool: "image",
    mode: "dry_run",
  });

  console.log(
    JSON.stringify(
      {
        mode: dryRun.mode,
        total: dryRun.total,
        passed: dryRun.passed,
        failed: dryRun.failed,
        skipped: dryRun.skipped,
        registryStats: countRegistryModels(),
      },
      null,
      2
    )
  );

  const dryFailed = dryRun.results.filter((r) => r.status === "failed");
  if (dryFailed.length) {
    console.log("\nDry-run failures:");
    for (const r of dryFailed) {
      console.log(`  - ${r.modelId}: ${r.errorCode ?? "failed"} ${r.message ?? ""}`);
    }
  }

  let liveRun = null;
  if (process.env.KREA_API_KEY?.trim()) {
    console.log("\n=== LIVE TEST — max 3 priority studio models ===\n");
    liveRun = await runKreaModelValidation({
      tool: "image",
      mode: "live_test",
      maxModels: 3,
      modelIds: [
        "flux_1_1_pro_ultra",
        "nano_realtime_render",
        "smart_auto_pilot",
      ],
    });

    console.log(
      JSON.stringify(
        {
          mode: liveRun.mode,
          tested: liveRun.tested,
          passed: liveRun.passed,
          failed: liveRun.failed,
          results: liveRun.results.map((r) => ({
            modelId: r.modelId,
            status: r.status,
            internalModel: r.internalModel,
            errorCode: r.errorCode,
            message: r.message?.slice(0, 120),
            hasImageUrl: r.hasImageUrl,
          })),
        },
        null,
        2
      )
    );

    console.log("\n=== LIVE TEST — flux_fast_draft (diagnostic) ===\n");
    const fluxDraft = await runKreaModelValidation({
      tool: "image",
      mode: "live_test",
      maxModels: 1,
      modelIds: ["flux_fast_draft"],
    });
    console.log(JSON.stringify(fluxDraft.results[0], null, 2));
    liveRun.results.push(...fluxDraft.results);
  }

  const outPath = join(root, "tmp", "krea-image-validation-report.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify({ dryRun, liveRun, checkedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`\nReport written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
