/** White-label UI models — internal engine only, no provider names in UI. */
export type StudioModelId =
  | "flux-pro-ultra"
  | "flux-fast-draft"
  | "nano-realtime"
  | "smart-auto";

export type StudioModelCard = {
  id: StudioModelId;
  label: string;
  description: string;
  credits: number;
  available: boolean;
};

export const STUDIO_MODELS: StudioModelCard[] = [
  {
    id: "flux-pro-ultra",
    label: "Flux 1.1 Pro Ultra",
    description: "Premium campaign visuals with sharp detail.",
    credits: 3,
    available: true,
  },
  {
    id: "flux-fast-draft",
    label: "Flux Fast Draft",
    description: "Quick iterations for concept exploration.",
    credits: 1,
    available: false,
  },
  {
    id: "nano-realtime",
    label: "Nano Realtime Render",
    description: "Fast preview renders for live creative sessions.",
    credits: 2,
    available: false,
  },
  {
    id: "smart-auto",
    label: "Smart Auto-Pilot",
    description: "Automatic model and format selection.",
    credits: 3,
    available: false,
  },
];

export type StudioFormatId = "square" | "vertical" | "landscape";

export type StudioFormatCard = {
  id: StudioFormatId;
  label: string;
  subtitle: string;
  aspectRatio: string;
  width: number;
  height: number;
};

export const STUDIO_FORMATS: StudioFormatCard[] = [
  {
    id: "square",
    label: "Square",
    subtitle: "1:1 · Feed posts",
    aspectRatio: "1:1",
    width: 1024,
    height: 1024,
  },
  {
    id: "vertical",
    label: "TikTok / Reels",
    subtitle: "9:16 · Short-form",
    aspectRatio: "9:16",
    width: 768,
    height: 1344,
  },
  {
    id: "landscape",
    label: "YouTube / Landscape",
    subtitle: "16:9 · Widescreen",
    aspectRatio: "16:9",
    width: 1344,
    height: 768,
  },
];

export const KREA_IMAGE_GENERATE_PATH = "/api/krea/image/generate";
export const GENERATIONS_API_PATH = "/api/generations";
