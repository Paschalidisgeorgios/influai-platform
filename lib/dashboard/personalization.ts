import { analyzePromptIntent, recommendWorkflow, type WorkflowRecommendation } from "@/lib/intent";

export const PERSONALIZATION_STORAGE_KEY = "influexai_dashboard_personalization";

export type StoredPersonalization = {
  lastPrompt?: string;
  lastRecommendation?: WorkflowRecommendation;
  preferredLanguage?: "en" | "de";
  preferredToolKey?: string;
  visitCount?: number;
  updatedAt?: string;
};

export type DashboardPersonalization = {
  recommendation: WorkflowRecommendation;
  deepLink: string;
  headlineEn: string;
  headlineDe: string;
  stored: StoredPersonalization;
};

function readStorage(): StoredPersonalization {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PERSONALIZATION_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredPersonalization;
  } catch {
    return {};
  }
}

function writeStorage(patch: StoredPersonalization): void {
  if (typeof window === "undefined") return;
  const next = {
    ...readStorage(),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(next));
}

export function previewDashboardPersonalization(
  prompt: string,
  language: "en" | "de" = "en"
): Omit<DashboardPersonalization, "stored"> {
  const signals = analyzePromptIntent(prompt);
  const recommendation = recommendWorkflow(signals);

  const params = new URLSearchParams();
  params.set("engine", recommendation.engineId);
  if (recommendation.durationSeconds) {
    params.set("duration", String(recommendation.durationSeconds));
  }
  if (prompt.trim()) params.set("prompt", prompt.trim());

  const deepLink = `${recommendation.href}?${params.toString()}`;

  return {
    recommendation,
    deepLink,
    headlineEn: recommendation.reasonEn,
    headlineDe: recommendation.reasonDe,
  };
}

export function buildDashboardPersonalization(
  prompt: string,
  language: "en" | "de" = "en"
): DashboardPersonalization {
  const stored = readStorage();
  const preview = previewDashboardPersonalization(prompt, language);

  writeStorage({
    lastPrompt: prompt.trim() || stored.lastPrompt,
    lastRecommendation: preview.recommendation,
    preferredLanguage: language,
    preferredToolKey: preview.recommendation.toolKey,
    visitCount: (stored.visitCount ?? 0) + 1,
  });

  return {
    ...preview,
    stored: readStorage(),
  };
}

export function readDashboardPersonalization(): StoredPersonalization {
  return readStorage();
}

export function clearDashboardPersonalization(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PERSONALIZATION_STORAGE_KEY);
}
