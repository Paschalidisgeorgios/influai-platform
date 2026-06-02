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
    idea: { id: "idea", label: "Idea", short: "One prompt" },
    images: { id: "images", label: "Image variations", short: "3 looks" },
    motion: { id: "motion", label: "Motion clip", short: "Reels-ready" },
    hooks: { id: "hooks", label: "Hooks", short: "Scroll-stoppers" },
    captions: { id: "captions", label: "Captions", short: "Post-ready" },
    score: { id: "score", label: "Creative Score", short: "Improve" },
    export: { id: "export", label: "Export", short: "Publish" },
  },
  de: {
    idea: { id: "idea", label: "Idee", short: "Ein Prompt" },
    images: { id: "images", label: "Bild-Variationen", short: "3 Looks" },
    motion: { id: "motion", label: "Motion-Clip", short: "Reels-ready" },
    hooks: { id: "hooks", label: "Hooks", short: "Scroll-Stoppers" },
    captions: { id: "captions", label: "Captions", short: "Post-ready" },
    score: { id: "score", label: "Creative Score", short: "Verbessern" },
    export: { id: "export", label: "Export", short: "Veröffentlichen" },
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
    eyebrow: "Product theatre",
    headline: "Watch one idea become a publish-ready pack.",
    body: "Illustrative demo — the same pipeline you run in the Creator Studio, without scrolling through ten feature sections.",
    disclaimer: "Demo only · illustrative outputs · no live generation on the landing page",
    cta: "Preview your first pack",
  },
  de: {
    eyebrow: "Product Theatre",
    headline: "Sieh, wie aus einer Idee ein publish-ready Pack wird.",
    body: "Illustrative Demo — dieselbe Pipeline wie im Creator Studio, ohne endlose Feature-Scrolls.",
    disclaimer: "Nur Demo · illustrative Outputs · keine Live-Generierung auf der Landing Page",
    cta: "Erstes Pack in der Vorschau",
  },
} as const;

export const KINETIC_HERO_COPY = {
  en: {
    pipelineLabel: "Full pipeline",
  },
  de: {
    pipelineLabel: "Volle Pipeline",
  },
} as const;

export const MODEL_EXPLORER_COPY = {
  en: {
    eyebrow: "Workflow explorer",
    headline: "Every tool, explained in one glance.",
    body: "Browse by category — what each workflow does, what you get, and whether it is live, preview, or coming soon. No provider jargon.",
  },
  de: {
    eyebrow: "Workflow-Explorer",
    headline: "Jedes Tool — kurz erklärt.",
    body: "Nach Kategorie durchstöbern: Was der Workflow macht, welcher Output entsteht und ob er live, in der Vorschau oder demnächst kommt. Ohne Provider-Jargon.",
  },
} as const;
