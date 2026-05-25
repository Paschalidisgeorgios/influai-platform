import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Boxes,
  Clapperboard,
  CreditCard,
  Film,
  GalleryVerticalEnd,
  ImageIcon,
  Layers,
  Mic2,
  Sparkles,
  Tag,
  UserRound,
  Wand2,
  Zap,
} from "lucide-react";

import {
  getComingSoonStudioModules,
  getOtherExpandingStudioModules,
  getStatusBadgeClass,
  getStatusLabel,
  LIVE_STUDIO_MODULES,
  type RoadmapModule,
} from "./roadmapModules";

type Language = "en" | "de";

export const MODULE_ICONS: Record<string, LucideIcon> = {
  "ai-agent": Bot,
  "standard-image": ImageIcon,
  "social-formats": Sparkles,
  "style-profiles": UserRound,
  "asset-gallery": GalleryVerticalEnd,
  credits: CreditCard,
  "fast-image-mode": Zap,
  "premium-image-mode": Sparkles,
  "edit-reference-mode": Layers,
  "brand-assets": Boxes,
  "video-studio": Film,
  "lip-sync-studio": Mic2,
  "cinema-agent": Clapperboard,
  "omni-campaign-agent": Wand2,
  "watermarked-promo-package": Tag,
};

function RoadmapCard({
  module,
  language,
}: {
  module: RoadmapModule;
  language: Language;
}) {
  const Icon = MODULE_ICONS[module.id] ?? Sparkles;
  const title = language === "en" ? module.titleEn : module.titleDe;
  const description =
    language === "en" ? module.descriptionEn : module.descriptionDe;
  const isLive = module.status === "live";

  return (
    <div
      className={`flex h-full flex-col rounded-[1.35rem] border p-5 sm:rounded-2xl sm:p-6 ${
        isLive
          ? "border-emerald-500/20 bg-emerald-500/[0.04]"
          : "border-white/10 bg-white/[0.035]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            isLive
              ? "bg-emerald-500/15 text-emerald-200"
              : "bg-[#d8ad5f]/12 text-[#d8ad5f]"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${getStatusBadgeClass(
            module.status
          )}`}
        >
          {getStatusLabel(module.status, language)}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-white">{title}</h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-white/50">{description}</p>
    </div>
  );
}

type RoadmapSectionProps = {
  language: Language;
  headingFontClass?: string;
};

export function RoadmapSection({
  language,
  headingFontClass = "",
}: RoadmapSectionProps) {
  const copy =
    language === "en"
      ? {
          eyebrow: "Roadmap",
          title: "Expanding studio modules",
          intro:
            "InfluExAi ships image creation today. Video Studio, Lip Sync Studio, Cinema Agent and Omni Campaign Agent are previewed below — not live, not billable, and not connected to generation APIs in this release.",
          liveTitle: "Available now",
          comingSoonTitle: "Coming soon & roadmap",
          comingSoonNote:
            "These modules are visible for planning only. No checkout, routing or credit usage yet.",
          plannedTitle: "More planned modules",
        }
      : {
          eyebrow: "Roadmap",
          title: "Erweiterbare Studio-Module",
          intro:
            "InfluExAi liefert heute Bild-Workflows. Video Studio, Lip Sync Studio, Cinema Agent und Omni Campaign Agent sind unten als Vorschau sichtbar — nicht live, nicht abrechenbar und in diesem Release nicht an Generierungs-APIs angebunden.",
          liveTitle: "Jetzt verfügbar",
          comingSoonTitle: "Demnächst & Roadmap",
          comingSoonNote:
            "Diese Module sind nur zur Planung sichtbar. Noch kein Checkout, Routing oder Credit-Verbrauch.",
          plannedTitle: "Weitere geplante Module",
        };

  const comingSoonModules = getComingSoonStudioModules();
  const otherPlannedModules = getOtherExpandingStudioModules();

  return (
    <section id="roadmap" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.35em] text-[#d8ad5f]">
        {copy.eyebrow}
      </p>

      <h2
        className={`${headingFontClass} max-w-4xl text-5xl font-bold leading-none tracking-tight sm:text-7xl`}
      >
        {copy.title}
      </h2>

      <p className="mt-8 max-w-3xl text-sm leading-7 text-white/55 sm:text-base">
        {copy.intro}
      </p>

      <div className="mt-12">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300/80">
          {copy.liveTitle}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_STUDIO_MODULES.map((module) => (
            <RoadmapCard key={module.id} module={module} language={language} />
          ))}
        </div>
      </div>

      <div className="mt-12">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#d8ad5f]/90">
          {copy.comingSoonTitle}
        </p>
        <p className="mb-4 max-w-3xl text-xs leading-5 text-white/40">
          {copy.comingSoonNote}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {comingSoonModules.map((module) => (
            <RoadmapCard key={module.id} module={module} language={language} />
          ))}
        </div>
      </div>

      {otherPlannedModules.length > 0 && (
        <div className="mt-12">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
            {copy.plannedTitle}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherPlannedModules.map((module) => (
              <RoadmapCard key={module.id} module={module} language={language} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
