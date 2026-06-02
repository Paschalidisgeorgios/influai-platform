import type { LandingLanguage } from "@/app/components/landing/magnificContent";

export type KineticHeroCopy = {
  badge: string;
  headline: string;
  rotatingPrefix: string;
  rotatingWords: readonly string[];
  subheadline: string;
  proofLine: string;
  primaryCta: string;
  secondaryCta: string;
  demoBadge: string;
  demoDisclaimer: string;
  /** One-line pack summary on small screens (compact hero card). */
  mobilePackSummary: string;
};

export const KINETIC_HERO_COPY: Record<LandingLanguage, KineticHeroCopy> = {
  en: {
    badge: "The Content Engine",
    headline: "From one idea to ready-to-post content.",
    rotatingPrefix: "Delivering",
    rotatingWords: [
      "image variations",
      "motion clips",
      "hooks",
      "captions",
      "hashtags",
      "export formats",
    ],
    subheadline:
      "InfluExAI turns rough ideas into creator-ready assets — with intelligent prompting, image variations, motion video, Creative Score and export-ready formats.",
    proofLine:
      "1 idea → 3 image variations → 1 motion clip → hooks → captions → export",
    primaryCta: "Preview your first pack",
    secondaryCta: "See the workflow",
    demoBadge: "Pack preview",
    demoDisclaimer: "Static demo · illustrative outputs only",
    mobilePackSummary: "Hooks · captions · hashtags · Creative Score · export formats",
  },
  de: {
    badge: "The Content Engine",
    headline: "Aus einer Idee wird postfertiger Content.",
    rotatingPrefix: "Liefert",
    rotatingWords: [
      "Bildvarianten",
      "Motion-Clips",
      "Hooks",
      "Captions",
      "Hashtags",
      "Exportformate",
    ],
    subheadline:
      "InfluExAI verwandelt grobe Ideen in creator-ready Assets — mit intelligentem Prompting, Bildvarianten, Motion-Video, Creative Score und exportfertigen Formaten.",
    proofLine:
      "1 Idee → 3 Bildvarianten → 1 Motion-Clip → Hooks → Captions → Export",
    primaryCta: "Erstes Paket previewen",
    secondaryCta: "Workflow ansehen",
    demoBadge: "Pack-Vorschau",
    demoDisclaimer: "Statische Demo · nur illustrative Beispiele",
    mobilePackSummary:
      "Hooks · Captions · Hashtags · Creative Score · Exportformate",
  },
};

export function getKineticHeroCopy(language: LandingLanguage): KineticHeroCopy {
  return KINETIC_HERO_COPY[language === "de" ? "de" : "en"];
}
