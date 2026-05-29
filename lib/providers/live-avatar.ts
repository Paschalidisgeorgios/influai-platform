import { fal } from "@fal-ai/client";
import { getKreaApiKey, kreaRequest, pollKreaJob } from "./krea";

/**
 * Live Avatar Studio (Motion Transfer).
 *
 * Animates a creator/persona portrait using motion, expression and head movement
 * from a driving video.
 *
 * Provider strategy:
 *   1. Krea — only when a confirmed motion-transfer endpoint is configured
 *      (KREA_MOTION_TRANSFER_MODEL_PATH). Krea has no confirmed public endpoint
 *      for this today, so this stays opt-in via env.
 *   2. fal.ai live portrait / motion transfer fallback (default).
 */

export const LIVE_AVATAR_CREDITS = 60;
export const LIVE_AVATAR_WORKFLOW = "live_avatar";

/** Server-only feature gate. */
export function isLiveAvatarEnabled(): boolean {
  return process.env.ENABLE_LIVE_AVATAR === "true";
}

/** fal.ai model for the portrait-animation fallback (override via env). */
function resolveFalMotionTransferModel(): string {
  return (
    process.env.FAL_MOTION_TRANSFER_MODEL?.trim() || "fal-ai/live-portrait"
  );
}

/** Optional confirmed Krea motion-transfer endpoint path. Unset by default. */
function resolveKreaMotionTransferModelPath(): string | null {
  const path = process.env.KREA_MOTION_TRANSFER_MODEL_PATH?.trim();
  return path ? path.replace(/^\/+/, "") : null;
}

export type LiveAvatarProvider = "krea" | "fal";

export type LiveAvatarResult = {
  provider: LiveAvatarProvider;
  model: string;
  videoUrl: string;
  providerJobId: string | null;
};

export type LiveAvatarInput = {
  sourceImageUrl: string;
  sourceVideoUrl: string;
};

/** Which provider will be used, given current configuration. */
export function resolveLiveAvatarProvider(): LiveAvatarProvider {
  const kreaPath = resolveKreaMotionTransferModelPath();
  if (
    kreaPath &&
    process.env.ENABLE_KREA_PROVIDER === "true" &&
    process.env.KREA_API_KEY?.trim()
  ) {
    return "krea";
  }
  return "fal";
}

/** Throws a runtime error (not a build crash) if the chosen provider is unconfigured. */
export function assertLiveAvatarProviderConfigured(): void {
  const provider = resolveLiveAvatarProvider();
  if (provider === "krea") {
    getKreaApiKey();
    return;
  }
  if (!process.env.FAL_KEY?.trim()) {
    throw new Error("FAL_KEY is not configured.");
  }
}

type FalLikeResult = {
  data?: unknown;
  video?: { url?: string };
  output?: { url?: string };
};

function extractFalVideoUrl(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;

  const candidate = result as Record<string, unknown> & FalLikeResult;
  const data = (candidate.data ?? candidate) as Record<string, unknown>;

  const video = data.video as { url?: string } | undefined;
  if (video?.url) return video.url;

  const output = data.output as { url?: string } | undefined;
  if (output?.url) return output.url;

  if (typeof data.video_url === "string") return data.video_url;
  if (typeof data.url === "string") return data.url;

  const videos = data.videos as Array<{ url?: string }> | undefined;
  if (Array.isArray(videos) && videos[0]?.url) return videos[0].url;

  return undefined;
}

const FAL_REQUEST_TIMEOUT_MS = 1000 * 60 * 9;

async function generateViaFal(input: LiveAvatarInput): Promise<LiveAvatarResult> {
  if (!process.env.FAL_KEY?.trim()) {
    throw new Error("FAL_KEY is not configured.");
  }

  const model = resolveFalMotionTransferModel();

  fal.config({ credentials: process.env.FAL_KEY });

  const result = await Promise.race([
    fal.subscribe(model, {
      input: {
        image_url: input.sourceImageUrl,
        video_url: input.sourceVideoUrl,
      },
      logs: false,
    }),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Live Avatar provider timed out.")),
        FAL_REQUEST_TIMEOUT_MS
      );
    }),
  ]);

  const videoUrl = extractFalVideoUrl(result);

  if (!videoUrl) {
    throw new Error("Live Avatar provider returned no video URL.");
  }

  const requestId =
    typeof (result as { requestId?: string }).requestId === "string"
      ? (result as { requestId?: string }).requestId ?? null
      : null;

  return {
    provider: "fal",
    model,
    videoUrl,
    providerJobId: requestId,
  };
}

type KreaJobLike = {
  job_id?: string;
  error?: string;
};

async function generateViaKrea(input: LiveAvatarInput): Promise<LiveAvatarResult> {
  const modelPath = resolveKreaMotionTransferModelPath();
  if (!modelPath) {
    throw new Error("Krea motion transfer model path is not configured.");
  }

  const model = `krea/${modelPath}`;

  const data = await kreaRequest<KreaJobLike>(`/generate/video/${modelPath}`, {
    method: "POST",
    body: JSON.stringify({
      image_url: input.sourceImageUrl,
      video_url: input.sourceVideoUrl,
    }),
  });

  const providerJobId =
    typeof data.job_id === "string" && data.job_id.trim().length > 0
      ? data.job_id.trim()
      : null;

  if (!providerJobId) {
    throw new Error("Krea did not return a job_id for motion transfer.");
  }

  const maxAttempts = 120;
  const intervalMs = 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const poll = await pollKreaJob(providerJobId);

    if (poll.status === "completed") {
      if (!poll.videoUrl) {
        throw new Error("Krea completed but returned no video URL.");
      }
      return {
        provider: "krea",
        model,
        videoUrl: poll.videoUrl,
        providerJobId,
      };
    }

    if (poll.status === "failed" || poll.status === "cancelled") {
      throw new Error(poll.errorMessage || "Krea motion transfer failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Krea motion transfer timed out while polling.");
}

export async function generateLiveAvatarVideo(
  input: LiveAvatarInput
): Promise<LiveAvatarResult> {
  const provider = resolveLiveAvatarProvider();

  if (provider === "krea") {
    return generateViaKrea(input);
  }

  return generateViaFal(input);
}
