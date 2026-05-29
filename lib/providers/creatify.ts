import type { ProviderGenerationResult, ProviderJobPollResult } from "./provider-types";
import { assertCreatifyConfigured } from "./flags";

const CREATIFY_API_BASE =
  process.env.CREATIFY_API_BASE_URL?.trim() || "https://api.creatify.ai";

type CreatifyAssetJob = {
  id?: string;
  status?: string;
  assets?: Array<{ url?: string; type?: string }>;
  error?: string;
  detail?: string;
};

function creatifyHeaders(): HeadersInit {
  assertCreatifyConfigured();
  return {
    "X-API-ID": process.env.CREATIFY_API_ID!.trim(),
    "X-API-KEY": process.env.CREATIFY_API_KEY!.trim(),
    "Content-Type": "application/json",
  };
}

function resolveCreatifyAdVideoModel(): string {
  return (
    process.env.CREATIFY_AD_VIDEO_MODEL?.trim() ||
    "kling-video/v1.6/image-to-video"
  );
}

export type CreatifyCreateAdVideoInput = {
  prompt: string;
  aspectRatio?: string;
  modelName?: string;
  webhookUrl?: string;
  extraInputParams?: Record<string, unknown>;
};

/**
 * Creates an async Creatify Asset Generator job.
 * Confirm `input_params` against GET /api/asset_generator/schemas/ for your account.
 */
export async function createCreatifyAdVideoJob(
  input: CreatifyCreateAdVideoInput
): Promise<ProviderGenerationResult> {
  const modelName = input.modelName || resolveCreatifyAdVideoModel();

  const inputParams: Record<string, unknown> = {
    prompt: input.prompt,
    aspect_ratio: input.aspectRatio || "9:16",
    ...input.extraInputParams,
  };

  const response = await fetch(`${CREATIFY_API_BASE}/api/asset_generator/`, {
    method: "POST",
    headers: creatifyHeaders(),
    body: JSON.stringify({
      model_name: modelName,
      input_params: inputParams,
      webhook_url: input.webhookUrl,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as CreatifyAssetJob;

  if (!response.ok) {
    const message =
      data.detail || data.error || `Creatify job create failed (${response.status}).`;
    throw new Error(message);
  }

  const providerJobId =
    typeof data.id === "string" && data.id.trim().length > 0 ? data.id.trim() : null;

  if (!providerJobId) {
    throw new Error("Creatify did not return a job id.");
  }

  return {
    provider: "creatify",
    model: modelName,
    providerJobId,
    raw: data,
  };
}

export async function pollCreatifyJob(
  jobId: string
): Promise<ProviderJobPollResult> {
  const response = await fetch(
    `${CREATIFY_API_BASE}/api/asset_generator/${encodeURIComponent(jobId)}/`,
    {
      method: "GET",
      headers: creatifyHeaders(),
    }
  );

  const data = (await response.json().catch(() => ({}))) as CreatifyAssetJob;

  if (!response.ok) {
    return {
      status: "failed",
      providerJobId: jobId,
      errorMessage:
        data.detail || data.error || `Creatify poll failed (${response.status}).`,
      raw: data,
    };
  }

  const statusRaw = (data.status || "processing").toLowerCase();
  let status: ProviderJobPollResult["status"] = "processing";

  if (statusRaw === "done" || statusRaw === "completed" || statusRaw === "success") {
    status = "completed";
  } else if (statusRaw === "failed" || statusRaw === "error") {
    status = "failed";
  } else if (statusRaw === "queued" || statusRaw === "pending") {
    status = "queued";
  }

  const videoAsset = data.assets?.find(
    (asset) =>
      asset.type === "video" ||
      (typeof asset.url === "string" && /\.(mp4|webm|mov)/i.test(asset.url))
  );
  const firstAssetUrl = data.assets?.[0]?.url;
  const videoUrl =
    typeof videoAsset?.url === "string"
      ? videoAsset.url
      : typeof firstAssetUrl === "string"
        ? firstAssetUrl
        : undefined;

  return {
    status,
    providerJobId: jobId,
    videoUrl,
    raw: data,
    errorMessage:
      status === "failed" ? data.error || data.detail || "Creatify job failed." : undefined,
  };
}
