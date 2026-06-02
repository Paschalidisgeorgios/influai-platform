import type { CreatorToolboxGroupId } from "@/app/lib/tools/creator-tools";

export type DashboardCommandLanguage = "en" | "de";

export const DASHBOARD_COMMAND_COPY = {
  en: {
    headline: "What are we making today?",
    promptPlaceholder: "Describe your idea…",
    promptLabel: "Your idea",
  },
  de: {
    headline: "Was machen wir heute?",
    promptPlaceholder: "Beschreibe deine Idee …",
    promptLabel: "Deine Idee",
  },
} as const;

export const DASHBOARD_CATEGORY_LABELS: Record<
  CreatorToolboxGroupId,
  { en: string; de: string }
> = {
  create: { en: "Create", de: "Erstellen" },
  edit: { en: "Edit", de: "Bearbeiten" },
  animate: { en: "Animate", de: "Animieren" },
  train: { en: "Train", de: "Trainieren" },
  optimize: { en: "Optimize", de: "Optimieren" },
  advanced: { en: "Advanced", de: "Erweitert" },
};

export function getDashboardCommandCopy(language: DashboardCommandLanguage) {
  return DASHBOARD_COMMAND_COPY[language];
}

export function getDashboardCategoryLabel(
  id: CreatorToolboxGroupId,
  language: DashboardCommandLanguage
): string {
  return DASHBOARD_CATEGORY_LABELS[id][language];
}
