export type RoadmapStatus = "live" | "planned" | "coming_soon" | "in_roadmap";

export type RoadmapModule = {
  id: string;
  titleEn: string;
  titleDe: string;
  descriptionEn: string;
  descriptionDe: string;
  status: RoadmapStatus;
};

export const LIVE_STUDIO_MODULES: RoadmapModule[] = [
  {
    id: "ai-agent",
    titleEn: "AI Agent",
    titleDe: "AI Agent",
    descriptionEn: "Natural-language image generation with guided creative modes.",
    descriptionDe: "Bildgenerierung per Briefing mit geführten Creative-Modi.",
    status: "live",
  },
  {
    id: "standard-image",
    titleEn: "Standard Image Generation",
    titleDe: "Standard Image Generation",
    descriptionEn: "Reliable campaign visuals with clear credit usage per image.",
    descriptionDe: "Zuverlässige Kampagnenvisuals mit klarem Credit-Verbrauch pro Bild.",
    status: "live",
  },
  {
    id: "social-formats",
    titleEn: "Social Formats",
    titleDe: "Social Formats",
    descriptionEn: "Presets for posts, stories, shorts and placement-ready exports.",
    descriptionDe: "Presets für Posts, Stories, Shorts und exportfertige Formate.",
    status: "live",
  },
  {
    id: "style-profiles",
    titleEn: "Style Profiles",
    titleDe: "Style Profiles",
    descriptionEn: "Reusable creative direction for look, mood and brand styling.",
    descriptionDe: "Wiederverwendbare Creative Direction für Look, Mood und Styling.",
    status: "live",
  },
  {
    id: "asset-gallery",
    titleEn: "Asset Gallery",
    titleDe: "Asset Gallery",
    descriptionEn: "Review, organize, favorite and download generated visuals.",
    descriptionDe: "Generierte Visuals prüfen, organisieren, favorisieren und herunterladen.",
    status: "live",
  },
  {
    id: "credits",
    titleEn: "Credits",
    titleDe: "Credits",
    descriptionEn: "Transparent balance and packages for image generation.",
    descriptionDe: "Transparentes Guthaben und Pakete für Bildgenerierung.",
    status: "live",
  },
];

/** Cinema, omni, social — roadmap preview only (no API). Video/lip sync may be live when flagged. */
export const COMING_SOON_STUDIO_MODULE_IDS = [
  "video-studio",
  "lip-sync-studio",
  "cinema-agent",
  "omni-campaign-agent",
  "social-planner",
] as const;

const VIDEO_STUDIO_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO === "true";
const LIP_SYNC_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC === "true";

export const EXPANDING_STUDIO_MODULES: RoadmapModule[] = [
  {
    id: "video-studio",
    titleEn: "Video Studio",
    titleDe: "Video Studio",
    descriptionEn:
      "Create short-form video campaigns, product clips and creator motion assets from prompts and images.",
    descriptionDe:
      "Erstelle Short-Form-Video-Kampagnen, Produktclips und Creator-Motion-Assets aus Prompts und Bildern.",
    status: VIDEO_STUDIO_PUBLIC_ENABLED ? "live" : "coming_soon",
  },
  {
    id: "lip-sync-studio",
    titleEn: "Lip Sync Studio",
    titleDe: "Lip Sync Studio",
    descriptionEn:
      "Sync talking creator clips from source media and an uploaded audio track (beta when enabled).",
    descriptionDe:
      "Synchronisiere Talking-Creator-Clips aus Quellmedien und einer hochgeladenen Audiospur (Beta, wenn aktiviert).",
    status: LIP_SYNC_PUBLIC_ENABLED ? "live" : "coming_soon",
  },
  {
    id: "cinema-agent",
    titleEn: "Cinema Agent",
    titleDe: "Cinema Agent",
    descriptionEn:
      "Plan campaign scenes, shot lists and visual sequences before generation.",
    descriptionDe:
      "Plane Kampagnen-Szenen, Shot Lists und Visual Sequences vor der Generierung.",
    status: "planned",
  },
  {
    id: "omni-campaign-agent",
    titleEn: "Omni Campaign Agent",
    titleDe: "Omni Campaign Agent",
    descriptionEn:
      "Turn a campaign idea into visuals, video concepts, captions and export-ready assets.",
    descriptionDe:
      "Wandle eine Kampagnen-Idee in Visuals, Video-Konzepte, Captions und exportfertige Assets um.",
    status: "in_roadmap",
  },
  {
    id: "social-planner",
    titleEn: "Social Planner",
    titleDe: "Social Planner",
    descriptionEn:
      "Plan posts and campaign calendars — preview only, no social posting API.",
    descriptionDe:
      "Plane Posts und Kampagnen-Kalender — nur Vorschau, keine Social-Posting-API.",
    status: "planned",
  },
  {
    id: "brand-safety",
    titleEn: "Brand Safety / Compliance",
    titleDe: "Brand Safety / Compliance",
    descriptionEn:
      "Policy checks and compliance hints for campaign assets (planned).",
    descriptionDe:
      "Policy-Checks und Compliance-Hinweise für Kampagnen-Assets (geplant).",
    status: "planned",
  },
  {
    id: "fast-image-mode",
    titleEn: "Fast Image Mode",
    titleDe: "Fast Image Mode",
    descriptionEn: "Rapid draft generation for early concepts and iteration.",
    descriptionDe: "Schnelle Draft-Generierung für frühe Konzepte und Iteration.",
    status: "planned",
  },
  {
    id: "premium-image-mode",
    titleEn: "Premium Image Mode",
    titleDe: "Premium Image Mode",
    descriptionEn: "Higher-fidelity image modes for polished campaign output.",
    descriptionDe: "Hochwertigere Bildmodi für ausgereifte Kampagnenvisuals.",
    status: "planned",
  },
  {
    id: "edit-reference-mode",
    titleEn: "Edit & Reference Mode",
    titleDe: "Edit & Reference Mode",
    descriptionEn: "Image editing and reference-based creative workflows.",
    descriptionDe: "Bildbearbeitung und referenzbasierte Creative-Workflows.",
    status: "planned",
  },
  {
    id: "brand-assets",
    titleEn: "Brand Assets",
    titleDe: "Brand Assets",
    descriptionEn: "Campaign kits, brand memory and reusable visual rules.",
    descriptionDe: "Campaign Kits, Brand Memory und wiederverwendbare Visual Rules.",
    status: "planned",
  },
  {
    id: "watermarked-promo-package",
    titleEn: "Watermarked Promo Package",
    titleDe: "Watermarked Promo-Paket",
    descriptionEn:
      "Planned monetization module: low-cost watermarked exports for early testing and brand discovery. Upgrade later to export without watermark.",
    descriptionDe:
      "Geplantes Monetarisierungsmodul: günstige Exporte mit sichtbarem InfluExAi-Wasserzeichen zum Testen und für Brand Discovery. Später Upgrade für Export ohne Wasserzeichen.",
    status: "planned",
  },
];

/** Subset shown in dashboard sidebar (disabled). */
export const DASHBOARD_SIDEBAR_PLANNED_IDS = [
  "fast-image-mode",
  "premium-image-mode",
  "video-studio",
  "lip-sync-studio",
  "brand-assets",
  "cinema-agent",
  "omni-campaign-agent",
] as const;

export function getRoadmapModulesByIds(ids: readonly string[]) {
  return EXPANDING_STUDIO_MODULES.filter((module) => ids.includes(module.id));
}

export function getComingSoonStudioModules() {
  return EXPANDING_STUDIO_MODULES.filter((module) =>
    (COMING_SOON_STUDIO_MODULE_IDS as readonly string[]).includes(module.id)
  );
}

export function getOtherExpandingStudioModules() {
  return EXPANDING_STUDIO_MODULES.filter(
    (module) =>
      !(COMING_SOON_STUDIO_MODULE_IDS as readonly string[]).includes(module.id)
  );
}

const STATUS_LABELS = {
  en: {
    live: "Live",
    planned: "Planned",
    coming_soon: "Coming soon",
    in_roadmap: "In roadmap",
  },
  de: {
    live: "Live",
    planned: "Geplant",
    coming_soon: "Demnächst",
    in_roadmap: "In Roadmap",
  },
} as const;

export function getStatusLabel(
  status: RoadmapStatus,
  language: "en" | "de"
): string {
  return STATUS_LABELS[language][status];
}

export function getStatusBadgeClass(status: RoadmapStatus): string {
  if (status === "live") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "coming_soon") {
    return "border-[#d8ad5f]/35 bg-[#d8ad5f]/15 text-[#d8ad5f]";
  }

  if (status === "in_roadmap") {
    return "border-violet-500/25 bg-violet-500/10 text-violet-200";
  }

  return "border-white/12 bg-white/[0.05] text-white/50";
}
