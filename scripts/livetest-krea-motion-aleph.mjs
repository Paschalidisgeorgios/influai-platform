/**
 * Live-test Runway Aleph motion transfer against Krea API.
 * Usage: node scripts/livetest-krea-motion-aleph.mjs
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

const { generateViaKreaSubscribe } = await import("../lib/krea/krea-subscribe-generation.ts");

const PORTRAIT = "https://picsum.photos/512/512";
const DRIVING_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

console.log("Testing Krea motion transfer: video/runway/aleph");
console.log("KREA_API_KEY present:", Boolean(process.env.KREA_API_KEY?.trim()));

try {
  const result = await generateViaKreaSubscribe({
    modelPath: "runway/aleph",
    prompt:
      "Apply the driving motion to the portrait while preserving identity and likeness.",
    sourceImageUrl: PORTRAIT,
    sourceVideoUrl: DRIVING_VIDEO,
    motionTransfer: true,
    expect: "video",
  });

  console.log("SUCCESS");
  console.log("videoUrl:", result.videoUrl);
  console.log("providerJobId:", result.providerJobId);
} catch (error) {
  console.error("FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
}
