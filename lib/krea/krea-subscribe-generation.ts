/**
 * Unified Krea generation via official SDK subscribe().
 */

import type { ProviderGenerationResult } from "@/lib/providers/provider-types";
import {
  extractImageUrl,
  extractProviderJobId,
  extractVideoUrl,
} from "@/lib/krea/response-extract";
import { assertOfficialKreaModelPath } from "./krea-official-catalog";
import {
  buildOfficialKreaInput,
  type KreaGenerationParams,
} from "./krea-request-builders";
import { ensureKreaAssetUrl } from "./krea-asset-upload";
import { kreaSubscribe } from "./krea-sdk-client";
import { resolveKreaModelId } from "@/lib/providers/krea";
import { KreaAPIError } from "@krea-ai/sdk";

export type KreaSubscribeGenerationInput = KreaGenerationParams & {
  modelPath: string;
  expect?: "image" | "video";
};

function extractUrlsFromSubscribeData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  const urls = record.urls;
  if (Array.isArray(urls) && typeof urls[0] === "string" && urls[0].trim()) {
    return urls[0].trim();
  }
  return undefined;
}

export async function generateViaKreaSubscribe(
  input: KreaSubscribeGenerationInput
): Promise<ProviderGenerationResult> {
  const modelPath = input.modelPath.replace(/^\/+/, "");
  const endpoint = assertOfficialKreaModelPath(modelPath);
  const expect =
    input.expect ?? (endpoint.kind === "video" ? "video" : "image");

  let resolvedInput = input;
  if (endpoint.kind === "video" || endpoint.kind === "enhance") {
    const externalImage =
      input.sourceImageUrl?.trim() ?? input.referenceImageUrl?.trim();
    const externalVideo = input.sourceVideoUrl?.trim();

    if (externalImage) {
      const kreaImageUrl = await ensureKreaAssetUrl(externalImage, {
        kind: "image",
        description:
          endpoint.kind === "enhance"
            ? "InfluExAi enhance source"
            : "InfluExAi portrait",
      });
      resolvedInput = {
        ...resolvedInput,
        sourceImageUrl: kreaImageUrl,
        referenceImageUrl: kreaImageUrl,
      };
    }

    if (endpoint.kind === "video" && externalVideo) {
      const kreaVideoUrl = await ensureKreaAssetUrl(externalVideo, {
        kind: "video",
        description: "InfluExAi driving video",
      });
      resolvedInput = {
        ...resolvedInput,
        sourceVideoUrl: kreaVideoUrl,
      };
    }
  }

  const { subscribePath, input: body } = buildOfficialKreaInput(
    modelPath,
    resolvedInput
  );

  let result;
  try {
    result = await kreaSubscribe({ subscribePath, input: body });
  } catch (error) {
    if (error instanceof KreaAPIError) {
      const body = error.body;
      const detail =
        typeof body === "object" && body !== null
          ? JSON.stringify(body)
          : typeof error.body === "string"
            ? error.body
            : error.message;
      throw new Error(
        `Krea API error (${error.status}): ${detail || "request failed"}`
      );
    }
    throw error;
  }
  const model = resolveKreaModelId(modelPath);

  const imageUrl =
    extractImageUrl(result.raw) ??
    extractImageUrl(result.data) ??
    extractUrlsFromSubscribeData(result.data);
  const videoUrl =
    extractVideoUrl(result.raw) ??
    extractVideoUrl(result.data) ??
    extractUrlsFromSubscribeData(result.data);
  const providerJobId =
    extractProviderJobId(result.raw) ??
    extractProviderJobId(result.data) ??
    result.providerJobId ??
    null;

  if (expect === "video") {
    if (!videoUrl) {
      throw new Error("Krea completed but did not return a video URL.");
    }
    return {
      provider: "krea",
      model,
      videoUrl,
      imageUrl: imageUrl ?? undefined,
      providerJobId: providerJobId ?? undefined,
      raw: result.raw,
    };
  }

  if (!imageUrl) {
    throw new Error("Krea completed but did not return an image URL.");
  }

  return {
    provider: "krea",
    model,
    imageUrl,
    videoUrl: videoUrl ?? undefined,
    providerJobId: providerJobId ?? undefined,
    raw: result.raw,
  };
}
