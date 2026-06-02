import type { LandingLanguage } from "@/app/components/landing/magnificContent";

export type NarrativeStepId =
  | "idea"
  | "prompt_assist"
  | "asset_plan"
  | "render"
  | "creative_score"
  | "export";

export type NarrativeStep = {
  id: NarrativeStepId;
  label: string;
  body: string;
};

export const NARRATIVE_STEP_ORDER: readonly NarrativeStepId[] = [
  "idea",
  "prompt_assist",
  "asset_plan",
  "render",
  "creative_score",
  "export",
] as const;

const STEPS: Record<LandingLanguage, Record<NarrativeStepId, NarrativeStep>> = {
  en: {
    idea: {
      id: "idea",
      label: "Idea",
      body: "Start with a rough idea.",
    },
    prompt_assist: {
      id: "prompt_assist",
      label: "Prompt Assist",
      body: "InfluExAI improves the idea with lighting, motion, style and format.",
    },
    asset_plan: {
      id: "asset_plan",
      label: "Asset Plan",
      body: "The Content Engine plans image variations, motion and copy.",
    },
    render: {
      id: "render",
      label: "Render",
      body: "Credits are used only when rendering starts.",
    },
    creative_score: {
      id: "creative_score",
      label: "Creative Score",
      body: "The asset is analyzed for clarity, format fit and social readiness.",
    },
    export: {
      id: "export",
      label: "Export",
      body: "Export-ready formats for TikTok, Reels, Story and Feed.",
    },
  },
  de: {
    idea: {
      id: "idea",
      label: "Idee",
      body: "Starte mit einer groben Idee.",
    },
    prompt_assist: {
      id: "prompt_assist",
      label: "Prompt Assist",
      body: "InfluExAI verbessert die Idee mit Licht, Motion, Stil und Format.",
    },
    asset_plan: {
      id: "asset_plan",
      label: "Asset-Plan",
      body: "The Content Engine plant Bildvarianten, Motion und Copy.",
    },
    render: {
      id: "render",
      label: "Render",
      body: "Credits werden erst beim Start des Renderns verwendet.",
    },
    creative_score: {
      id: "creative_score",
      label: "Creative Score",
      body: "Das Asset wird auf Klarheit, Format-Fit und Social-Tauglichkeit analysiert.",
    },
    export: {
      id: "export",
      label: "Export",
      body: "Exportfertige Formate für TikTok, Reels, Story und Feed.",
    },
  },
};

export function getNarrativeSteps(language: LandingLanguage): NarrativeStep[] {
  const lang = language === "de" ? "de" : "en";
  return NARRATIVE_STEP_ORDER.map((id) => STEPS[lang][id]);
}

export function getNarrativeStep(
  id: NarrativeStepId,
  language: LandingLanguage
): NarrativeStep {
  const lang = language === "de" ? "de" : "en";
  return STEPS[lang][id];
}

/** Fixed copy column height — prevents layout shift between steps */
export const NARRATIVE_COPY_MIN_HEIGHT = "min-h-[7.5rem] sm:min-h-[8.25rem]";

/** Fixed visual stage footprint */
export const NARRATIVE_VISUAL_HEIGHT =
  "h-[min(22rem,52vh)] min-h-[18rem] sm:h-[min(24rem,48vh)]";

export const NARRATIVE_STAGE_COPY = {
  en: {
    demoBadge: "Workflow preview",
    demoNote: "Static demo · no live generation · no credits used",
    roughIdea: "Premium skincare on marble, soft studio light",
    enhancedPrompt:
      "Luxury skincare on white marble, soft diffused studio light, premium editorial product photography",
    creditsLabel: "Estimated render",
    creditsValue: "45 credits",
    scoreValue: "84",
    formats: ["TikTok", "Reels", "Story", "Feed"] as const,
  },
  de: {
    demoBadge: "Workflow-Vorschau",
    demoNote: "Statische Demo · keine Live-Generierung · keine Credits",
    roughIdea: "Premium-Skincare auf Marmor, weiches Studiolicht",
    enhancedPrompt:
      "Luxus-Skincare auf weißem Marmor, weiches diffuses Studiolicht, Premium-Editorial-Produktfotografie",
    creditsLabel: "Geschätzter Render",
    creditsValue: "45 Credits",
    scoreValue: "84",
    formats: ["TikTok", "Reels", "Story", "Feed"] as const,
  },
} as const;
