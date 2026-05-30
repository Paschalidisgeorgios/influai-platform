/** Hyper-Kinetic Obsidian — dashboard design tokens */
export const OBS_SPRING = { type: "spring" as const, stiffness: 200, damping: 25 };

export const OBS = {
  page: "bg-[#050505] text-white cursor-none antialiased",
  glass:
    "rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]",
  glassPad:
    "rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-6 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]",
  glassFloat:
    "rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-4 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]",
  mono: "font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500",
  title:
    "font-extrabold uppercase italic leading-none tracking-tight text-white",
  titleHero:
    "text-4xl font-extrabold uppercase italic leading-none tracking-tight sm:text-5xl md:text-6xl",
  amberBtn:
    "rounded-xl bg-amber-500 font-black text-neutral-950 transition hover:bg-amber-600",
  engineActive:
    "border-amber-500 bg-amber-500/10 font-bold text-amber-400 ring-1 ring-amber-500",
  engineIdle:
    "border-neutral-800/80 bg-neutral-900/40 text-neutral-300 hover:border-amber-500/40",
  pillActive:
    "border-amber-500 bg-amber-500/10 font-bold text-amber-400 ring-1 ring-amber-500",
  pillIdle:
    "border-neutral-800/80 bg-neutral-900/40 text-neutral-400 hover:border-amber-500/40",
  input:
    "w-full resize-none border-none bg-transparent text-base text-white placeholder-white/40 caret-amber-400 outline-none focus:outline-none focus:ring-1 focus:ring-amber-500/30",
} as const;

export type ObsidianEngineId = "flux-pro" | "kling-3" | "nano-realtime" | "smart-autopilot";

export type ObsidianEngineCard = {
  id: ObsidianEngineId;
  label: string;
  descriptionEn: string;
  descriptionDe: string;
  toolKey: "image" | "video";
  kreaModelId: string;
  href: string;
};

export const OBSIDIAN_HOME_ENGINES: ObsidianEngineCard[] = [
  {
    id: "flux-pro",
    label: "FLUX 1.1 PRO",
    descriptionEn: "Ultra-realistic studio lighting and flagship image synthesis.",
    descriptionDe: "Ultra-realistisches Studiolicht und Flaggschiff-Bildsynthese.",
    toolKey: "image",
    kreaModelId: "krea-2-large",
    href: "/dashboard/image",
  },
  {
    id: "kling-3",
    label: "KLING 3.0",
    descriptionEn: "Cinematic motion vectors and Hollywood-grade physics.",
    descriptionDe: "Kinematische Bewegungsvektoren und Hollywood-Physik.",
    toolKey: "video",
    kreaModelId: "kling-3",
    href: "/dashboard/video",
  },
  {
    id: "nano-realtime",
    label: "NANO REALTIME",
    descriptionEn: "Millisecond concept pipeline for instant ideation.",
    descriptionDe: "Millisekunden-Pipeline für sofortige Konzept-Generierung.",
    toolKey: "image",
    kreaModelId: "nano-banana",
    href: "/dashboard/image",
  },
  {
    id: "smart-autopilot",
    label: "SMART AUTO-PILOT",
    descriptionEn: "Intelligent routing — optimal engine per prompt.",
    descriptionDe: "Intelligentes Routing — optimale Engine pro Prompt.",
    toolKey: "image",
    kreaModelId: "flux-11-pro",
    href: "/dashboard/image",
  },
];

export const OBSIDIAN_NAV: {
  href: string;
  labelEn: string;
  labelDe: string;
  exact?: boolean;
}[] = [
  { href: "/dashboard", labelEn: "Studio", labelDe: "Studio", exact: true },
  { href: "/dashboard/image", labelEn: "Image", labelDe: "Bild" },
  { href: "/dashboard/video", labelEn: "Video", labelDe: "Video" },
  { href: "/dashboard/train", labelEn: "Style Training", labelDe: "Style Training" },
  { href: "/dashboard/lipsync", labelEn: "Lip-Sync", labelDe: "Lip-Sync" },
  { href: "/dashboard/motion-transfer", labelEn: "Motion", labelDe: "Motion" },
  { href: "/dashboard/assets", labelEn: "Assets", labelDe: "Assets" },
  { href: "/dashboard/credits", labelEn: "Credits", labelDe: "Credits" },
] as const;