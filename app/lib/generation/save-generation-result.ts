/**
 * Persist provider output to storage and mark generation completed.
 */

import {
  markGenerationCompleted,
  uploadImageFromRemoteUrl,
  uploadVideoFromRemoteUrl,
} from "@/lib/generation/poc-shared";
import type { EngineRunOutput } from "@/app/lib/providers/provider-router";

export type SavedGenerationAsset = {
  assetUrl: string;
  outputType: "image" | "video";
  imageUrl?: string;
  videoUrl?: string;
};

export async function saveGenerationResult(params: {
  userId: string;
  generationId: string;
  providerResult: EngineRunOutput;
  providerJobId?: string | null;
}): Promise<SavedGenerationAsset> {
  const { userId, generationId, providerResult } = params;

  let imageUrl: string | undefined;
  let videoUrl: string | undefined;

  if (providerResult.imageUrl) {
    imageUrl = await uploadImageFromRemoteUrl({
      userId,
      remoteUrl: providerResult.imageUrl,
    });
  } else if (providerResult.videoUrl) {
    videoUrl = await uploadVideoFromRemoteUrl({
      userId,
      remoteUrl: providerResult.videoUrl,
    });
  } else {
    throw new Error("NO_OUTPUT_URL");
  }

  await markGenerationCompleted({
    generationId,
    imageUrl: imageUrl ?? null,
    videoUrl: videoUrl ?? null,
    providerJobId: params.providerJobId ?? providerResult.providerJobId ?? null,
  });

  const outputType =
    providerResult.outputType === "video" || videoUrl ? "video" : "image";
  const assetUrl = videoUrl ?? imageUrl!;

  return {
    assetUrl,
    outputType,
    imageUrl,
    videoUrl,
  };
}
