import { getKreaApiKey, kreaRequest, pollKreaJob } from "./krea";
import { getKreaMotionTransferModelPath, resolveLiveAvatarProviderState } from "./provider-strategy";

/**
 * Motion transfer — Krea-only when KREA_MOTION_TRANSFER_MODEL_PATH is set.
 */

export const LIVE_AVATAR_CREDITS = 60;
export const LIVE_AVATAR_WORKFLOW = "live_avatar";

export type LiveAvatarProvider = "krea";

export { resolveLiveAvatarProviderState, type LiveAvatarProviderState } from "./provider-strategy";

export function isLiveAvatarEnabled(): boolean {
  const serverFlag = process.env.ENABLE_LIVE_AVATAR;
  const publicFlag = process.env.NEXT_PUBLIC_ENABLE_LIVE_AVATAR;
  if (serverFlag === "false" || publicFlag === "false") return false;
  return resolveLiveAvatarProviderState() === "krea";
}

export function resolveLiveAvatarProvider(): LiveAvatarProvider {
  if (resolveLiveAvatarProviderState() !== "krea") {
    throw new Error("Motion transfer is not available yet.");
  }
  return "krea";
}

export function assertLiveAvatarProviderConfigured(): void {
  if (resolveLiveAvatarProviderState() !== "krea") {
    throw new Error("Motion transfer is not implemented on the image engine yet.");
  }
  getKreaApiKey();
  if (!getKreaMotionTransferModelPath()) {
    throw new Error("Motion transfer model path is not configured.");
  }
}

export type LiveAvatarGenerateInput = {
  sourceImageUrl: string;
  sourceVideoUrl: string;
  prompt?: string;
};

export type LiveAvatarGenerateResult = {
  videoUrl: string;
  provider: LiveAvatarProvider;
  providerJobId?: string;
};

export async function generateLiveAvatarVideo(
  input: LiveAvatarGenerateInput
): Promise<LiveAvatarGenerateResult> {
  assertLiveAvatarProviderConfigured();
  const modelPath = getKreaMotionTransferModelPath()!;

  const job = await kreaRequest<{ job_id?: string; id?: string }>(
    `/generate/${modelPath}`,
    {
      method: "POST",
      body: JSON.stringify({
        image_url: input.sourceImageUrl,
        video_url: input.sourceVideoUrl,
        prompt:
          input.prompt?.trim() ||
          "Animate portrait with driving video motion.",
      }),
    }
  );

  const jobId = job.job_id ?? job.id;
  if (!jobId) {
    throw new Error("Motion transfer did not return a job id.");
  }

  const completed = await pollKreaJob(jobId);
  const videoUrl =
    typeof completed.videoUrl === "string" ? completed.videoUrl : null;
  if (!videoUrl) {
    throw new Error("Motion transfer did not return a video URL.");
  }

  return {
    videoUrl,
    provider: "krea",
    providerJobId: jobId,
  };
}
