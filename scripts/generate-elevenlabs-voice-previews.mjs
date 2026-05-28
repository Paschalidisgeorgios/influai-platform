/**
 * Generate local ElevenLabs voice preview MP3s for Lip Sync / Talking Creator UI.
 *
 * Usage (from project root):
 *   node scripts/generate-elevenlabs-voice-previews.mjs
 *
 * Requires ELEVENLABS_API_KEY and configured ELEVENLABS_VOICE_* vars in .env.local
 * (or the shell environment). Does not overwrite existing preview files.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "public", "audio", "voices");

const PREVIEW_TEXT =
  "Hi, I'm your InfluExAi creator voice. Use me for social videos, product campaigns and talking creator clips.";

const VOICE_ENV_BY_KEY = {
  roger: "ELEVENLABS_VOICE_ROGER",
  sarah: "ELEVENLABS_VOICE_SARAH",
  laura: "ELEVENLABS_VOICE_LAURA",
  charlie: "ELEVENLABS_VOICE_CHARLIE",
  george: "ELEVENLABS_VOICE_GEORGE",
  callum: "ELEVENLABS_VOICE_CALLUM",
  river: "ELEVENLABS_VOICE_RIVER",
  harry: "ELEVENLABS_VOICE_HARRY",
  liam: "ELEVENLABS_VOICE_LIAM",
  alice: "ELEVENLABS_VOICE_ALICE",
  matilda: "ELEVENLABS_VOICE_MATILDA",
  will: "ELEVENLABS_VOICE_WILL",
  jessica: "ELEVENLABS_VOICE_JESSICA",
  eric: "ELEVENLABS_VOICE_ERIC",
  bella: "ELEVENLABS_VOICE_BELLA",
  chris: "ELEVENLABS_VOICE_CHRIS",
  brian: "ELEVENLABS_VOICE_BRIAN",
  daniel: "ELEVENLABS_VOICE_DANIEL",
  lily: "ELEVENLABS_VOICE_LILY",
  adam: "ELEVENLABS_VOICE_ADAM",
  bill: "ELEVENLABS_VOICE_BILL",
};

async function loadEnvFiles() {
  for (const filename of [".env.local", ".env"]) {
    const envPath = path.join(projectRoot, filename);

    try {
      const content = await fs.readFile(envPath, "utf8");

      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;

        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) continue;

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        continue;
      }
      throw error;
    }
  }
}

async function synthesizePreview(voiceId, apiKey) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: PREVIEW_TEXT,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `ElevenLabs TTS failed (${response.status}): ${errorText.slice(0, 300)}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  await loadEnvFiles();

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

  if (!apiKey) {
    console.error(
      "missing env: ELEVENLABS_API_KEY is not set. Add it to .env.local or your shell environment."
    );
    process.exitCode = 1;
    return;
  }

  await fs.mkdir(outputDir, { recursive: true });

  const summary = {
    created: 0,
    skipped: 0,
    missingEnv: 0,
    failed: 0,
  };

  console.log(`Output directory: ${outputDir}`);
  console.log(`Voices in mapping: ${Object.keys(VOICE_ENV_BY_KEY).length}\n`);

  for (const [voiceKey, envName] of Object.entries(VOICE_ENV_BY_KEY)) {
    const voiceId = process.env[envName]?.trim();
    const outputPath = path.join(outputDir, `${voiceKey}.mp3`);

    if (!voiceId) {
      console.log(`missing env: ${voiceKey} (${envName} is not set)`);
      summary.missingEnv += 1;
      continue;
    }

    try {
      await fs.access(outputPath);
      console.log(`skipped: ${voiceKey} (${path.relative(projectRoot, outputPath)} exists)`);
      summary.skipped += 1;
      continue;
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) {
        console.error(`failed: ${voiceKey} (could not check output file)`);
        console.error(error instanceof Error ? error.message : String(error));
        summary.failed += 1;
        continue;
      }
    }

    try {
      const audioBuffer = await synthesizePreview(voiceId, apiKey);
      await fs.writeFile(outputPath, audioBuffer);
      console.log(`created: ${voiceKey} -> ${path.relative(projectRoot, outputPath)}`);
      summary.created += 1;
    } catch (error) {
      console.error(`failed: ${voiceKey}`);
      console.error(error instanceof Error ? error.message : String(error));
      summary.failed += 1;
    }
  }

  console.log("\nSummary:");
  console.log(`  created: ${summary.created}`);
  console.log(`  skipped: ${summary.skipped}`);
  console.log(`  missing env: ${summary.missingEnv}`);
  console.log(`  failed: ${summary.failed}`);

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Script failed:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
