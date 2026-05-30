/** Client-only workspace session hints — no secrets, no PII beyond prompt text. */

export const WORKSPACE_LS = {
  lastView: "influexai_last_view",
  lastPrompt: "influexai_last_prompt",
  lastModel: "influexai_last_model",
  lastFormat: "influexai_last_format",
  hasRecentAssets: "influexai_has_recent_assets",
  hasFailedGenerations: "influexai_has_failed_generations",
  lastGeneratedAt: "influexai_last_generated_at",
  resumePrompt: "influexai_resume_prompt",
} as const;

export type WorkspaceSessionSnapshot = {
  lastView?: string;
  lastPrompt?: string;
  lastModel?: string;
  lastFormat?: string;
  hasRecentAssets?: boolean;
  hasFailedGenerations?: boolean;
  lastGeneratedAt?: string;
};

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readWorkspaceSession(): WorkspaceSessionSnapshot {
  return {
    lastView: safeGet(WORKSPACE_LS.lastView) ?? undefined,
    lastPrompt: safeGet(WORKSPACE_LS.lastPrompt) ?? undefined,
    lastModel: safeGet(WORKSPACE_LS.lastModel) ?? undefined,
    lastFormat: safeGet(WORKSPACE_LS.lastFormat) ?? undefined,
    hasRecentAssets: safeGet(WORKSPACE_LS.hasRecentAssets) === "1",
    hasFailedGenerations: safeGet(WORKSPACE_LS.hasFailedGenerations) === "1",
    lastGeneratedAt: safeGet(WORKSPACE_LS.lastGeneratedAt) ?? undefined,
  };
}

export function saveWorkspaceSession(patch: WorkspaceSessionSnapshot): void {
  if (patch.lastView) safeSet(WORKSPACE_LS.lastView, patch.lastView);
  if (patch.lastPrompt !== undefined) {
    if (patch.lastPrompt) safeSet(WORKSPACE_LS.lastPrompt, patch.lastPrompt);
    else safeRemove(WORKSPACE_LS.lastPrompt);
  }
  if (patch.lastModel) safeSet(WORKSPACE_LS.lastModel, patch.lastModel);
  if (patch.lastFormat) safeSet(WORKSPACE_LS.lastFormat, patch.lastFormat);
  if (patch.hasRecentAssets !== undefined) {
    safeSet(WORKSPACE_LS.hasRecentAssets, patch.hasRecentAssets ? "1" : "0");
  }
  if (patch.hasFailedGenerations !== undefined) {
    safeSet(
      WORKSPACE_LS.hasFailedGenerations,
      patch.hasFailedGenerations ? "1" : "0"
    );
  }
  if (patch.lastGeneratedAt) {
    safeSet(WORKSPACE_LS.lastGeneratedAt, patch.lastGeneratedAt);
  }
}

export function getLastPrompt(): string | null {
  return safeGet(WORKSPACE_LS.lastPrompt);
}

export function setResumePromptFlag(enabled: boolean): void {
  if (enabled) safeSet(WORKSPACE_LS.resumePrompt, "1");
  else safeRemove(WORKSPACE_LS.resumePrompt);
}

export function consumeResumePromptFlag(): boolean {
  const v = safeGet(WORKSPACE_LS.resumePrompt) === "1";
  if (v) safeRemove(WORKSPACE_LS.resumePrompt);
  return v;
}

export function markRecentAssetGenerated(): void {
  saveWorkspaceSession({
    hasRecentAssets: true,
    hasFailedGenerations: false,
    lastGeneratedAt: new Date().toISOString(),
  });
}

export function markGenerationFailed(): void {
  saveWorkspaceSession({ hasFailedGenerations: true });
}

export function clearWorkspaceSessionHints(): void {
  Object.values(WORKSPACE_LS).forEach((key) => safeRemove(key));
}
