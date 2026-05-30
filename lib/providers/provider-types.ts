/** Normalized provider identifiers stored on `generations` rows. */
export type GenerationProviderName = "krea" | "creatify" | "openai" | "elevenlabs";

export type ProviderGenerationResult = {
  provider: GenerationProviderName;
  model: string;
  imageUrl?: string;
  videoUrl?: string;
  providerJobId?: string;
  raw?: unknown;
};

export type ProviderJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type ProviderJobPollResult = {
  status: ProviderJobStatus;
  imageUrl?: string;
  videoUrl?: string;
  providerJobId: string;
  raw?: unknown;
  errorMessage?: string;
};
