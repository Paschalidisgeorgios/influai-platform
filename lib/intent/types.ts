/** Creative intent signals — provider-agnostic, no vendor names in user-facing layer */

export type CreativeModality = "image" | "video" | "lip_sync" | "motion" | "enhance";

export type UserPersonaHint = "creator" | "brand" | "agency" | "enterprise" | "unknown";

export type FormatHint =
  | "square"
  | "vertical"
  | "horizontal"
  | "cinematic"
  | "thumbnail"
  | "unknown";

export type IntentSignals = {
  rawPrompt: string;
  normalizedPrompt: string;
  wordCount: number;
  modalities: CreativeModality[];
  primaryModality: CreativeModality;
  formatHint: FormatHint;
  personaHint: UserPersonaHint;
  keywords: string[];
  confidence: number;
};

export type WorkflowRecommendation = {
  toolKey: CreativeModality;
  engineId: string;
  formatId: string;
  durationSeconds?: 5 | 10;
  href: string;
  reasonEn: string;
  reasonDe: string;
  confidence: number;
};
