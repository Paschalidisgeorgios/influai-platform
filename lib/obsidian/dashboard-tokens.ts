/** Hyper-Kinetic Obsidian — dashboard design tokens */
import { A11Y } from "@/lib/obsidian/a11y-tokens";

export const OBS_SPRING = { type: "spring" as const, stiffness: 200, damping: 25 };

export const OBS = {
  page: "bg-[#070A12] text-[#F9FAFB] antialiased",
  glass:
    "rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]",
  glassPad:
    "rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-6 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]",
  glassFloat:
    "rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-4 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]",
  mono: "font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-400",
  title:
    "font-extrabold uppercase italic leading-none tracking-tight text-white",
  titleHero:
    "text-4xl font-extrabold uppercase italic leading-none tracking-tight sm:text-5xl md:text-6xl",
  amberBtn: `${A11Y.lavaPrimaryCta}`,
  disabledBtn: A11Y.disabled,
  engineActive:
    "border border-white/[0.08] bg-amber-500/10 font-bold text-amber-300 ring-2 ring-amber-500/50 shadow-[0_0_24px_rgba(245,158,11,0.14)]",
  engineIdle:
    "border border-white/[0.08] bg-neutral-900/40 text-neutral-200 hover:-translate-y-px hover:ring-1 hover:ring-amber-500/35 hover:shadow-[0_0_16px_rgba(245,158,11,0.08)] outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12]",
  pillActive:
    "border border-white/[0.08] bg-amber-500/10 font-bold text-amber-300 ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.12)]",
  pillIdle:
    "border border-white/[0.08] bg-neutral-900/40 text-neutral-300 hover:-translate-y-px hover:ring-1 hover:ring-amber-500/30 hover:shadow-[0_0_12px_rgba(245,158,11,0.08)] outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12]",
  input: `w-full resize-none border-none bg-transparent text-base text-white placeholder-neutral-500 caret-amber-400 ${A11Y.inputFocus}`,
} as const;

export type ObsidianEngineId =
  | "create-image"
  | "create-video"
  | "social-asset-pack"
  | "hooks-captions"
  | "export-pack";

export type ObsidianEngineCard = {
  id: ObsidianEngineId;
  labelEn: string;
  labelDe: string;
  descriptionEn: string;
  descriptionDe: string;
  toolKey: "image" | "video" | "pack";
  kreaModelId: string;
  href: string;
};

export function getObsidianEngineLabel(
  engine: Pick<ObsidianEngineCard, "labelEn" | "labelDe">,
  language: "en" | "de"
): string {
  return language === "de" ? engine.labelDe : engine.labelEn;
}

/** MVP create actions — user-facing labels only; internal model ids stay stable. */
export const OBSIDIAN_HOME_ENGINES: ObsidianEngineCard[] = [
  {
    id: "social-asset-pack",
    labelEn: "Social Asset Pack",
    labelDe: "Social Asset Pack",
    descriptionEn:
      "Turn one idea into image variations, a motion clip, hooks, captions, hashtags and export-ready formats.",
    descriptionDe:
      "Verwandle eine Idee in Bild-Varianten, einen Motion-Clip, Hooks, Captions, Hashtags und export-fertige Formate.",
    toolKey: "pack",
    kreaModelId: "",
    href: "/dashboard",
  },
  {
    id: "create-image",
    labelEn: "Create Image",
    labelDe: "Bild erstellen",
    descriptionEn:
      "Generate creator visuals, product shots and social assets.",
    descriptionDe:
      "Erstelle Creator-Visuals, Produktshots und Social Assets.",
    toolKey: "image",
    kreaModelId: "flux-11-pro",
    href: "/dashboard/image",
  },
  {
    id: "create-video",
    labelEn: "Create Motion Video",
    labelDe: "Motion-Video erstellen",
    descriptionEn:
      "Turn an idea into a short AI-generated motion video.",
    descriptionDe:
      "Verwandle eine Idee in ein kurzes KI-generiertes Motion-Video.",
    toolKey: "video",
    kreaModelId: "fal_kling_v3_t2v",
    href: "/dashboard/video",
  },
];

export const OBSIDIAN_NAV: {
  href: string;
  labelEn: string;
  labelDe: string;
  exact?: boolean;
}[] = [
  { href: "/dashboard", labelEn: "Create", labelDe: "Erstellen", exact: true },
  { href: "/dashboard/gallery", labelEn: "Gallery", labelDe: "Galerie" },
  { href: "/dashboard/credits", labelEn: "Credits", labelDe: "Credits" },
  { href: "/dashboard/settings", labelEn: "Settings", labelDe: "Einstellungen" },
] as const;
