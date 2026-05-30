import { getKreaImageStudioModel } from "@/lib/ai/krea-image-studio-models";

export type WorkspaceIntent =
  | "continue_last_work"
  | "create_new_asset"
  | "review_assets"
  | "top_up_credits"
  | "complete_setup"
  | "explore_models";

export type WorkspaceTargetView = "image" | "assets" | "billing" | "home";

export type WorkspaceRecommendation = {
  titleDe: string;
  titleEn: string;
  subtitleDe: string;
  subtitleEn: string;
  primaryActionDe: string;
  primaryActionEn: string;
  secondaryActionDe?: string;
  secondaryActionEn?: string;
  intent: WorkspaceIntent;
  targetView: WorkspaceTargetView;
  confidence: number;
};

export type WorkspaceContextInput = {
  userName?: string | null;
  credits?: number | null;
  lastTool?: string | null;
  lastPrompt?: string | null;
  hasRecentAssets?: boolean;
  hasFailedGenerations?: boolean;
  lastGeneratedAt?: string | null;
};

const VIEW_PATH: Record<WorkspaceTargetView, string> = {
  image: "/dashboard/image",
  assets: "/dashboard/assets",
  billing: "/dashboard/credits",
  home: "/dashboard",
};

export function workspaceTargetPath(view: WorkspaceTargetView): string {
  return VIEW_PATH[view];
}

function formatLastToolLabel(lastTool?: string | null): string | null {
  if (!lastTool?.trim()) return null;
  const studio = getKreaImageStudioModel(lastTool);
  if (studio) return studio.label;
  return lastTool.replace(/_/g, " ").replace(/-/g, " ");
}

function hasWorkspaceHistory(input: WorkspaceContextInput): boolean {
  return Boolean(
    input.lastPrompt?.trim() ||
      input.lastTool ||
      input.hasRecentAssets ||
      input.lastGeneratedAt
  );
}

/** Rule-based next step — no ML; honest copy only. */
export function getWorkspaceRecommendation(
  input: WorkspaceContextInput
): WorkspaceRecommendation {
  const toolLabel = formatLastToolLabel(input.lastTool);
  const credits = input.credits ?? null;

  if (credits !== null && credits <= 0) {
    return {
      titleDe: "Credits aufladen, um weiterzuarbeiten",
      titleEn: "Top up credits to keep creating",
      subtitleDe:
        "Basierend auf deinem Workspace — aktuell sind keine Credits verfügbar.",
      subtitleEn:
        "Based on your workspace — you have no credits available right now.",
      primaryActionDe: "Credits aufladen",
      primaryActionEn: "Top up credits",
      secondaryActionDe: "Assets ansehen",
      secondaryActionEn: "View assets",
      intent: "top_up_credits",
      targetView: "billing",
      confidence: 0.95,
    };
  }

  if (input.hasFailedGenerations && input.lastPrompt?.trim()) {
    return {
      titleDe: "Letzten Entwurf neu starten",
      titleEn: "Restart your last draft",
      subtitleDe:
        "Basierend auf deinem letzten Prompt — du kannst den Entwurf im Image Studio erneut starten.",
      subtitleEn:
        "Based on your last prompt — you can run the draft again in Image Studio.",
      primaryActionDe: "Weiterarbeiten",
      primaryActionEn: "Continue",
      secondaryActionDe: "Neu starten",
      secondaryActionEn: "Start fresh",
      intent: "continue_last_work",
      targetView: "image",
      confidence: 0.82,
    };
  }

  if (input.lastPrompt?.trim()) {
    const toolHintDe = toolLabel
      ? ` Du hast zuletzt Image Studio${toolLabel ? ` mit ${toolLabel}` : ""} genutzt.`
      : "";
    const toolHintEn = toolLabel
      ? ` You last used Image Studio${toolLabel ? ` with ${toolLabel}` : ""}.`
      : "";

    return {
      titleDe: "Mit deinem letzten Kampagnenvisual weitermachen?",
      titleEn: "Continue your last campaign visual?",
      subtitleDe: `Empfohlener nächster Schritt: Preview verfeinern oder Asset speichern.${toolHintDe}`,
      subtitleEn: `Suggested next step: refine the preview or save the asset.${toolHintEn}`,
      primaryActionDe: "Weiterarbeiten",
      primaryActionEn: "Continue",
      secondaryActionDe: "Assets ansehen",
      secondaryActionEn: "View assets",
      intent: "continue_last_work",
      targetView: "image",
      confidence: 0.88,
    };
  }

  if (input.hasRecentAssets) {
    return {
      titleDe: "Deine letzten Assets prüfen",
      titleEn: "Review your recent assets",
      subtitleDe:
        "Basierend auf deinem letzten Workspace — schau dir deine generierten Visuals an.",
      subtitleEn:
        "Based on your last workspace — review your generated visuals.",
      primaryActionDe: "Assets ansehen",
      primaryActionEn: "View assets",
      secondaryActionDe: "Neues Asset erstellen",
      secondaryActionEn: "Create new asset",
      intent: "review_assets",
      targetView: "assets",
      confidence: 0.75,
    };
  }

  if (!hasWorkspaceHistory(input)) {
    return {
      titleDe: "Erstes Kampagnenvisual erstellen",
      titleEn: "Create your first campaign visual",
      subtitleDe:
        "Starte mit einem Prompt im Image Studio — empfohlener Einstieg für neue Workspaces.",
      subtitleEn:
        "Start with a prompt in Image Studio — the recommended entry for new workspaces.",
      primaryActionDe: "Neues Asset erstellen",
      primaryActionEn: "Create new asset",
      secondaryActionDe: "Modelle erkunden",
      secondaryActionEn: "Explore models",
      intent: "create_new_asset",
      targetView: "image",
      confidence: 0.7,
    };
  }

  return {
    titleDe: "Workspace fortsetzen",
    titleEn: "Resume your workspace",
    subtitleDe: "Basierend auf deinem letzten Workspace — wähle den nächsten Schritt.",
    subtitleEn: "Based on your last workspace — pick your next step.",
    primaryActionDe: "Image Studio öffnen",
    primaryActionEn: "Open Image Studio",
    secondaryActionDe: "Assets ansehen",
    secondaryActionEn: "View assets",
    intent: "explore_models",
    targetView: "image",
    confidence: 0.6,
  };
}

export function buildGreetingHeadline(
  userName: string | null | undefined,
  isDe: boolean
): string {
  if (userName?.trim()) {
    return isDe
      ? `Willkommen zurück, ${userName.trim()}.`
      : `Welcome back, ${userName.trim()}.`;
  }
  return isDe ? "Willkommen zurück." : "Welcome back.";
}

/** First name only — never full email. */
export function deriveWorkspaceDisplayName(
  metadata?: Record<string, unknown> | null,
  email?: string | null
): string | null {
  const fullName =
    typeof metadata?.full_name === "string" ? metadata.full_name : null;
  const metaName = typeof metadata?.name === "string" ? metadata.name : null;
  const full = fullName || metaName;
  if (full?.trim()) {
    return full.trim().split(/\s+/)[0] ?? null;
  }
  if (email?.includes("@")) {
    const local = email.split("@")[0] ?? "";
    const token = local.split(/[._-]/)[0];
    if (!token) return null;
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  }
  return null;
}

export const COPILOT_PROMPT_EXAMPLES = {
  de: ["rote haare fitness marke", "luxus parfum ad", "creator video tiktok"],
  en: ["red hair fitness brand", "luxury perfume ad", "creator video tiktok"],
} as const;
