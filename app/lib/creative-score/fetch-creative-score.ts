import type { CreativeScoreDimensionId } from "@/lib/copy/creative-score-copy";

export type FetchedCreativeScore = {
  score: number;
  rating: "low" | "medium" | "high";
  dimensions?: { id: CreativeScoreDimensionId; score: number }[];
  positives: string[];
  improvements: string[];
  hooks: string[];
  captions: string[];
  hashtags: string[];
  improvedPrompt?: string;
  weakestDimensionId: CreativeScoreDimensionId;
  recommendedFix: string;
  estimatedPotentialScore: number;
};

export async function fetchCreativeScore(input: {
  assetUrl: string;
  prompt: string;
  outputType: "image" | "video";
  language: "en" | "de";
  getToken: () => Promise<string | null>;
}): Promise<FetchedCreativeScore | null> {
  const token = await input.getToken();
  if (!token) return null;

  const res = await fetch("/api/creative-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      assetUrl: input.assetUrl,
      prompt: input.prompt,
      outputType: input.outputType,
      actionId: input.outputType === "video" ? "create_video" : "create_image",
      currentLanguage: input.language,
    }),
  });

  const data = (await res.json()) as FetchedCreativeScore & {
    success?: boolean;
    error?: string;
  };

  if (!res.ok || data.success === false) return null;
  return data;
}
