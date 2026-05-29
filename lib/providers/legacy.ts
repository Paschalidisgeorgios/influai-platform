/**
 * Legacy provider entry points (unchanged during migration).
 *
 * - OpenAI image: `app/api/generate/process/route.ts` → `processOpenAIImage`
 * - fal.ai: `app/api/generate/process/route.ts` → flux / kling / lip sync / etc.
 * - ElevenLabs TTS: `app/api/generate/process/route.ts` → `synthesizeElevenLabsAudio`
 *
 * Do not remove these paths until Krea/Creatify replacements are verified in production.
 *
 * When `ENABLE_KREA_PROVIDER=true` and legacy flags are off, image/video studio
 * workflows route through `lib/generation/krea-worker.ts` instead.
 */

export const LEGACY_PROVIDER_LOCATIONS = {
  queueRoute: "app/api/generate/route.ts",
  workerRoute: "app/api/generate/process/route.ts",
  lipSyncUpload: "app/api/lip-sync/upload/route.ts",
  elevenLabsVoices: "lib/lip-sync/elevenlabs-voices.ts",
} as const;
