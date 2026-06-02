/**
 * Run fal.ai live validation tests (no credits, no DB writes).
 * Usage: npx tsx scripts/fal-live-validation.mjs [modelId...]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

const DEFAULT_IDS = [
  "fal_flux_schnell",
  "fal_topaz_image_upscale",
  "fal_kling_v3_t2v",
  "fal_kling_v3_i2v",
  "fal_kling_v3_motion_control",
  "fal_seedance_2_i2v",
  "fal_sync_lipsync_v2",
];

async function main() {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_IDS;
  const { runFalModelValidation } = await import(
    "../lib/ai/fal-model-validation.ts"
  );

  const results = [];
  for (const id of ids) {
    console.log(`\n--- Testing ${id} ---`);
    const started = Date.now();
    try {
      const summary = await runFalModelValidation({
        mode: "live_test",
        modelIds: [id],
        maxModels: 1,
      });
      const r = summary.results[0];
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`${id} | ${r.status} | ${r.errorCode ?? "OK"} | ${elapsed}s`);
      if (r.message) console.log(r.message.slice(0, 200));
      results.push(r);
    } catch (e) {
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`${id} | failed | ERROR | ${elapsed}s`);
      console.log(msg.slice(0, 300));
      results.push({ modelId: id, status: "failed", errorCode: "ERROR", message: msg });
    }
  }

  const outPath = path.join(root, "tmp/fal-live-validation-report.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2)
  );
  console.log("\nReport:", outPath);
  console.log(
    "Summary:",
    results.filter((r) => r.status === "passed").length,
    "passed /",
    results.filter((r) => r.status === "failed").length,
    "failed /",
    results.filter((r) => r.status === "skipped").length,
    "skipped"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
