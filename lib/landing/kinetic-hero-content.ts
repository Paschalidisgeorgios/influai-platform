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
    badge: "AI Creator Studio — Social Asset Packs",
    headline: "One idea. Three images. One video. Ready to post.",
    rotatingPrefix: "Each pack includes",
    rotatingWords: [
      "3 image variations",
      "1 motion clip",
      "Creative Score",
      "hooks",
      "captions",
      "export ZIP",
    ],
    subheadline:
      "InfluExAi builds your complete content bundle — images, motion video, Creative Score, hooks and captions. In under 10 minutes.",
    proofLine: "Idea → Images → Video → Score → Hooks → Export → Post",
    primaryCta: "Create your free Pack",
    secondaryCta: "See how it works",
    demoBadge: "Pack preview",
    demoDisclaimer: "Static demo · illustrative outputs only",
    mobilePackSummary: "3 images · motion · score · hooks · captions · ZIP",
  },
  de: {
    badge: "AI Creator Studio — Social Asset Packs",
    headline: "Eine Idee. Drei Bilder. Ein Video. Bereit zum Posten.",
    rotatingPrefix: "Jedes Pack enthält",
    rotatingWords: [
      "3 Bildvarianten",
      "1 Motion-Clip",
      "Creative Score",
      "Hooks",
      "Captions",
      "Export-ZIP",
    ],
    subheadline:
      "InfluExAi erstellt dein komplettes Content-Bundle — Bilder, Motion Video, Creative Score, Hooks und Captions. In unter 10 Minuten.",
    proofLine: "Idee → Bilder → Video → Score → Hooks → Export → Posten",
    primaryCta: "Kostenloses Pack erstellen",
    secondaryCta: "So funktioniert es",
    demoBadge: "Pack-Vorschau",
    demoDisclaimer: "Statische Demo · nur illustrative Beispiele",
    mobilePackSummary: "3 Bilder · Motion · Score · Hooks · Captions · ZIP",
  },
};

export function getKineticHeroCopy(language: LandingLanguage): KineticHeroCopy {
  return KINETIC_HERO_COPY[language === "de" ? "de" : "en"];
}
