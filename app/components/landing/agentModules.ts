import type { LandingLanguage } from "./magnificContent";

export type EngineModule = {
  id: string;
  titleEn: string;
  titleDe: string;
  descEn: string;
  descDe: string;
};

/** Shown in Agent Command Loop — landing-only module showcase */
export const ENGINE_MODULES: EngineModule[] = [
  {
    id: "style-profiles",
    titleEn: "Style Profiles",
    titleDe: "Style Profiles",
    descEn: "Reusable brand styles",
    descDe: "Wiederverwendbare Markenstile",
  },
  {
    id: "image-studio",
    titleEn: "Image Studio",
    titleDe: "Image Studio",
    descEn: "Campaign-ready visuals",
    descDe: "Kampagnenfähige Visuals",
  },
  {
    id: "product-photo",
    titleEn: "Product Photography",
    titleDe: "Product Photography",
    descEn: "Product visuals for ads and shops",
    descDe: "Produktvisuals für Ads & Shops",
  },
  {
    id: "brand-assets",
    titleEn: "Brand Assets",
    titleDe: "Brand Assets",
    descEn: "Brand-consistent asset series",
    descDe: "Markenkonforme Asset-Serien",
  },
  {
    id: "video-engine",
    titleEn: "Video Engine",
    titleDe: "Video Engine",
    descEn: "Cinematic motion clips",
    descDe: "Cinematic Motion Clips",
  },
  {
    id: "motion-transfer",
    titleEn: "Motion Transfer",
    titleDe: "Motion Transfer",
    descEn: "Creator movement and avatar motion",
    descDe: "Creator-Bewegung & Avatar-Motion",
  },
  {
    id: "lip-sync",
    titleEn: "Lip-Sync",
    titleDe: "Lip-Sync",
    descEn: "Talking creator videos",
    descDe: "Sprechende Creator-Videos",
  },
  {
    id: "campaign-planner",
    titleEn: "Campaign Planner",
    titleDe: "Campaign Planner",
    descEn: "Prompts, captions and campaign structure",
    descDe: "Prompts, Captions und Kampagnenstruktur",
  },
];

/** Maps agent loop track index → highlighted module id */
export const TRACK_MODULE_HIGHLIGHT: Record<number, string> = {
  0: "style-profiles",
  1: "video-engine",
  2: "image-studio",
  3: "campaign-planner",
};

export function engineModulesCopy(language: LandingLanguage) {
  const isDe = language === "de";
  return {
    title: isDe ? "Aktive Engine-Module" : "Available engine modules",
    modules: ENGINE_MODULES.map((m) => ({
      id: m.id,
      title: isDe ? m.titleDe : m.titleEn,
      desc: isDe ? m.descDe : m.descEn,
    })),
  };
}
