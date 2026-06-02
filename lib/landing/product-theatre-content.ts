import type { LandingLanguage } from "@/app/components/landing/magnificContent";

export type TheatreNarrativeStepId =
  | "idea"
  | "images"
  | "motion"
  | "hooks"
  | "captions"
  | "score"
  | "export";

export type TheatreNarrativeStep = {
  id: TheatreNarrativeStepId;
  label: string;
  short: string;
};

export const THEATRE_NARRATIVE_ORDER: readonly TheatreNarrativeStepId[] = [
  "idea",
  "images",
  "motion",
  "hooks",
  "captions",
  "score",
  "export",
] as const;

const STEPS: Record<
  LandingLanguage,
  Record<TheatreNarrativeStepId, TheatreNarrativeStep>
> = {
  en: {
    idea: { id: "idea", label: "Idea", short: "One sentence" },
    images: { id: "images", label: "Images", short: "3 variations" },
    motion: { id: "motion", label: "Video", short: "5s clip" },
    hooks: { id: "hooks", label: "Hooks", short: "5 options" },
    captions: { id: "captions", label: "Captions", short: "3 ready to post" },
    score: { id: "score", label: "Score", short: "Tips included" },
    export: { id: "export", label: "Export", short: "One ZIP" },
  },
  de: {
    idea: { id: "idea", label: "Idee", short: "Ein Satz" },
    images: { id: "images", label: "Bilder", short: "3 Varianten" },
    motion: { id: "motion", label: "Video", short: "5s Clip" },
    hooks: { id: "hooks", label: "Hooks", short: "5 Optionen" },
    captions: { id: "captions", label: "Captions", short: "3 postfertig" },
    score: { id: "score", label: "Score", short: "Tipps inklusive" },
    export: { id: "export", label: "Export", short: "Eine ZIP" },
  },
};

export function getTheatreNarrativeSteps(
  language: LandingLanguage
): TheatreNarrativeStep[] {
  const lang = language === "de" ? "de" : "en";
  return THEATRE_NARRATIVE_ORDER.map((id) => STEPS[lang][id]);
}

export const PRODUCT_THEATRE_COPY = {
  en: {
    eyebrow: "How it works",
    headline: "One idea becomes a full post pack.",
    body: "Same steps as in the studio. This page shows a demo — no live render here.",
    disclaimer: "Demo only · sample outputs · not a live generation",
    cta: "Create your free Pack",
  },
  de: {
    eyebrow: "So funktioniert es",
    headline: "Eine Idee wird ein komplettes Post-Pack.",
    body: "Gleiche Schritte wie im Studio. Hier nur eine Demo — kein Live-Render.",
    disclaimer: "Nur Demo · Beispiel-Outputs · keine Live-Generierung",
    cta: "Kostenloses Pack erstellen",
  },
} as const;

export const KINETIC_HERO_COPY = {
  en: {
    pipelineLabel: "Pack pipeline",
  },
  de: {
    pipelineLabel: "Pack-Pipeline",
  },
} as const;

export const MODEL_EXPLORER_COPY = {
  en: {
    eyebrow: "Studio tools",
    headline: "What each step delivers.",
    body: "See the output per tool — image, video, score or ZIP. Live, preview or coming soon.",
  },
  de: {
    eyebrow: "Studio-Tools",
    headline: "Was jeder Schritt liefert.",
    body: "Output pro Tool — Bild, Video, Score oder ZIP. Live, Vorschau oder demnächst.",
  },
} as const;
