/**
 * Structured Krea worker logs — no secrets, no API keys, no full prompts.
 */

export type KreaWorkerLogContext = {
  requestId?: string;
  generationId: string;
  userId: string;
  activeTool?: string;
  workflow?: string;
  selectedModelId?: string;
  selectedFormat?: string;
  provider?: string;
  model?: string;
  promptLength?: number;
  cost?: number;
  providerJobId?: string | null;
  pollAttempt?: number;
  imageUrl?: string | null;
  videoUrl?: string | null;
  status?: string;
  errorMessage?: string;
  responseKeys?: string[];
  phase: string;
};

export function logKreaWorkerEvent(context: KreaWorkerLogContext): void {
  const payload = {
    ts: new Date().toISOString(),
    ...context,
  };
  if (context.errorMessage) {
    console.error("[krea-worker]", JSON.stringify(payload));
  } else {
    console.info("[krea-worker]", JSON.stringify(payload));
  }
}
