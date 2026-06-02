import {
  getEngineCredits,
  getEngineCreditsByLegacyModelId,
} from "@/app/lib/engines/catalog";

/** Registry-backed credits for Video Studio (central catalog). */
export function getVideoModelBaseCredits(modelId: string): number {
  return (
    getEngineCreditsByLegacyModelId(modelId) ??
    getEngineCredits("video_engine")
  );
}

export function getVideoStudioCreditCost(modelId: string): number {
  return getVideoModelBaseCredits(modelId);
}

export function getVideoDurationOptions(modelId: string): Array<{
  seconds: 5 | 10;
  credits: number;
}> {
  const credits = getVideoModelBaseCredits(modelId);
  return [
    { seconds: 5, credits },
    { seconds: 10, credits },
  ];
}
