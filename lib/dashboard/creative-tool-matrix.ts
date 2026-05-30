/**
 * InfluExAi Creative Suite — tool status matrix (source of truth).
 * Sidebar shows Krea-only active tools; legacy entries remain for archived routes.
 */

import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Box,
  CalendarDays,
  Film,
  GalleryVerticalEnd,
  Home,
  ImageIcon,
  Layers3,
  Mic2,
  Network,
  Package,
  Palette,
  Pencil,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Video,
  Wand2,
  Workflow,
  Zap,
} from "lucide-react";
import {
  isKreaPlatformToolEnabled,
  KREA_PLATFORM_ACTIVE_TOOLS,
} from "@/lib/platform/krea-only-platform";

export type ActiveTool =
  | null
  | "image"
  | "video"
  | "enhancer"
  | "realtime"
  | "edit"
  | "lipsync"
  | "motion_transfer"
  | "3d_objects"
  | "video_restyle"
  | "audio"
  | "apps"
  | "product_photography"
  | "brand_assets"
  | "campaign_builder"
  | "style_profiles"
  | "batch_generator"
  | "moodboards"
  | "train_lora"
  | "node_editor";

export type ImplementationType = "krea" | "fallback" | "mvp";
export type OutputType =
  | "image"
  | "video"
  | "audio"
  | "plan"
  | "profile"
  | "moodboard";
export type ToolCategory = "primary" | "engines" | "optional";

export type WorkspaceKind =
  | "studio_image"
  | "studio_video"
  | "studio_lip_sync"
  | "live_avatar"
  | "style_profiles"
  | "krea_image_tool"
  | "video_restyle_tool"
  | "mvp_planner"
  | "assets"
  | "billing"
  | "home";

export type ImageModeKey =
  | "standard"
  | "fast_draft"
  | "ugc_look"
  | "premium_image"
  | "brand_assets"
  | "reference_edit"
  | "enhance_asset";

export type CreativeToolMatrixEntry = {
  key: ActiveTool;
  href: string;
  icon: LucideIcon;
  labelEn: string;
  labelDe: string;
  titleEn: string;
  titleDe: string;
  subtitleEn: string;
  subtitleDe: string;
  descriptionEn: string;
  descriptionDe: string;
  commandBarBadges: string[];
  category: ToolCategory;
  implementationType: ImplementationType;
  workflow: string;
  outputType: OutputType;
  creditCost: number;
  workspaceKind: WorkspaceKind;
  /** For studio_image workspace */
  initialImageMode?: ImageModeKey;
  /** API route used by handleGenerateForTool */
  generateRoute?: "/api/generate" | "/api/live-avatar/generate" | "/api/krea/image/generate";
  /** Body field for imageMode / workflow on /api/generate */
  imageMode?: string;
};

function filterActiveMatrixEntries(
  entries: CreativeToolMatrixEntry[]
): CreativeToolMatrixEntry[] {
  return entries.filter((entry) => isKreaPlatformToolEnabled(entry.key));
}

export const CREATIVE_TOOL_MATRIX: CreativeToolMatrixEntry[] = [
  {
    key: "image",
    href: "/dashboard/image",
    icon: ImageIcon,
    labelEn: "Image Studio",
    labelDe: "Image Studio",
    category: "engines",
    titleEn: "Image Studio",
    titleDe: "Image Studio",
    subtitleEn: "Create campaign-ready visuals in any style.",
    subtitleDe: "Erstelle kampagnenfähige Visuals in jedem Stil.",
    descriptionEn: "Generate campaign-ready visuals with premium image models.",
    descriptionDe: "Erstelle kampagnenfähige Visuals mit Premium-Bildmodellen.",
    commandBarBadges: ["Flux 1.1 Engine", "Nano Banana", "4K Image"],
    implementationType: "krea",
    workflow: "standard",
    outputType: "image",
    creditCost: 1,
    workspaceKind: "studio_image",
    initialImageMode: "standard",
    generateRoute: "/api/krea/image/generate",
    imageMode: "standard",
  },
  {
    key: "video",
    href: "/dashboard/video",
    icon: Video,
    labelEn: "Video Engine",
    labelDe: "Video Engine",
    category: "engines",
    titleEn: "Video Engine",
    titleDe: "Video Engine",
    subtitleEn: "Turn images and prompts into campaign-ready motion.",
    subtitleDe: "Verwandle Bilder und Prompts in kampagnenfähige Bewegung.",
    descriptionEn: "Image-to-video motion for social campaigns.",
    descriptionDe: "Image-to-Video-Motion für Social-Kampagnen.",
    commandBarBadges: ["Kling 3.0", "Seedance", "6s Clip"],
    implementationType: "krea",
    workflow: "video_image_to_video",
    outputType: "video",
    creditCost: 25,
    workspaceKind: "studio_video",
    generateRoute: "/api/generate",
    imageMode: "video_image_to_video",
  },
  {
    key: "enhancer",
    href: "/dashboard/enhancer",
    icon: Sparkles,
    labelEn: "Asset Enhancer",
    labelDe: "Asset Enhancer",
    category: "engines",
    titleEn: "Asset Enhancer",
    titleDe: "Asset Enhancer",
    subtitleEn: "Improve quality, clarity and resolution.",
    subtitleDe: "Verbessere Qualität, Klarheit und Auflösung.",
    descriptionEn: "Upscale and refine images for export.",
    descriptionDe: "Skaliere und veredle Bilder für den Export.",
    commandBarBadges: ["Ultra Detail", "4K/8K Enhance", "Clean Export"],
    implementationType: "krea",
    workflow: "enhance_asset",
    outputType: "image",
    creditCost: 4,
    workspaceKind: "studio_image",
    initialImageMode: "enhance_asset",
    generateRoute: "/api/generate",
    imageMode: "enhance_asset",
  },
  {
    key: "realtime",
    href: "/dashboard/realtime",
    icon: Zap,
    labelEn: "Realtime Canvas",
    labelDe: "Realtime Canvas",
    category: "engines",
    titleEn: "Realtime Canvas",
    titleDe: "Realtime Canvas",
    subtitleEn: "Explore ideas live with fast visual feedback.",
    subtitleDe: "Entwickle Ideen live mit schnellem visuellem Feedback.",
    descriptionEn: "Fast draft previews for rapid creative iteration.",
    descriptionDe: "Schnelle Draft-Previews für kreative Iteration.",
    commandBarBadges: ["Fast Draft", "Instant Preview", "Iterate"],
    implementationType: "krea",
    workflow: "fast_draft",
    outputType: "image",
    creditCost: 1,
    workspaceKind: "krea_image_tool",
    initialImageMode: "fast_draft",
    generateRoute: "/api/generate",
    imageMode: "fast_draft",
  },
  {
    key: "edit",
    href: "/dashboard/edit",
    icon: Pencil,
    labelEn: "Advanced Canvas Edit",
    labelDe: "Advanced Canvas Edit",
    category: "engines",
    titleEn: "Advanced Canvas Edit",
    titleDe: "Advanced Canvas Edit",
    subtitleEn: "Transform an existing image into a new campaign asset.",
    subtitleDe: "Verwandle ein bestehendes Bild in ein neues Kampagnenasset.",
    descriptionEn: "Reference-based image editing with precise instructions.",
    descriptionDe: "Referenzbasiertes Bild-Editing mit präzisen Anweisungen.",
    commandBarBadges: ["Canvas Edit", "Expand / Relight", "Reference Input"],
    implementationType: "krea",
    workflow: "reference_edit",
    outputType: "image",
    creditCost: 5,
    workspaceKind: "studio_image",
    initialImageMode: "reference_edit",
    generateRoute: "/api/generate",
    imageMode: "reference_edit",
  },
  {
    key: "lipsync",
    href: "/dashboard/lipsync",
    icon: Mic2,
    labelEn: "Video Lipsync",
    labelDe: "Video Lipsync",
    category: "engines",
    titleEn: "Video Lipsync",
    titleDe: "Video Lipsync",
    subtitleEn: "Sync creator videos with audio or generated voice.",
    subtitleDe: "Synchronisiere Creator-Videos mit Audio oder generierter Stimme.",
    descriptionEn: "Lip-sync video with uploaded or system voice audio.",
    descriptionDe: "Lip-Sync-Video mit hochgeladenem oder System-Audio.",
    commandBarBadges: ["Voice Sync", "Audio Sync", "Video Dialogue"],
    implementationType: "mvp",
    workflow: "lip_sync",
    outputType: "video",
    creditCost: 30,
    workspaceKind: "studio_lip_sync",
    generateRoute: "/api/generate",
    imageMode: "lip_sync",
  },
  {
    key: "motion_transfer",
    href: "/dashboard/motion-transfer",
    icon: RefreshCw,
    labelEn: "Motion Transfer",
    labelDe: "Motion Transfer",
    category: "engines",
    titleEn: "Motion Transfer",
    titleDe: "Motion Transfer",
    subtitleEn:
      "Animate a creator portrait using motion, expression and head movement from a driving video.",
    subtitleDe:
      "Animiere ein Creator-Porträt mit Bewegung, Mimik und Kopfhaltung aus einem Bewegungs-Video.",
    descriptionEn: "Animate a portrait with motion from a driving video.",
    descriptionDe: "Animiere ein Porträt mit Bewegung aus einem Referenzvideo.",
    commandBarBadges: ["Driving Video", "Character Motion", "Expression Transfer"],
    implementationType: "mvp",
    workflow: "live_avatar",
    outputType: "video",
    creditCost: 60,
    workspaceKind: "live_avatar",
    generateRoute: "/api/live-avatar/generate",
  },
  {
    key: "3d_objects",
    href: "/dashboard/3d",
    icon: Box,
    labelEn: "3D Object Render",
    labelDe: "3D Object Render",
    category: "engines",
    titleEn: "3D Object Render",
    titleDe: "3D Object Render",
    subtitleEn: "Generate textured 3D-style product renders from text.",
    subtitleDe: "Erstelle texturierte 3D-Style-Produktrenders aus Text.",
    descriptionEn: "3D-style campaign renders (image pipeline).",
    descriptionDe: "3D-Style-Kampagnenrenders (Bild-Pipeline).",
    commandBarBadges: ["3D Mesh Look", "Textured Object", "Product Render"],
    implementationType: "krea",
    workflow: "standard",
    outputType: "image",
    creditCost: 3,
    workspaceKind: "krea_image_tool",
    initialImageMode: "premium_image",
    generateRoute: "/api/generate",
    imageMode: "premium_image",
  },
  {
    key: "video_restyle",
    href: "/dashboard/video-restyle",
    icon: Wand2,
    labelEn: "Video Restyle",
    labelDe: "Video Restyle",
    category: "engines",
    titleEn: "Video Restyle",
    titleDe: "Video Restyle",
    subtitleEn: "Restyle campaign videos with prompts and references.",
    subtitleDe: "Restyle Kampagnenvideos mit Prompts und Referenzen.",
    descriptionEn: "Style transfer preview and restyle planning.",
    descriptionDe: "Style-Transfer-Preview und Restyle-Planung.",
    commandBarBadges: ["Style Transfer", "Video Reference", "Campaign Look"],
    implementationType: "krea",
    workflow: "reference_edit",
    outputType: "image",
    creditCost: 5,
    workspaceKind: "video_restyle_tool",
    generateRoute: "/api/generate",
    imageMode: "reference_edit",
  },
  {
    key: "audio",
    href: "/dashboard/audio",
    icon: AudioLines,
    labelEn: "Audio Studio",
    labelDe: "Audio Studio",
    category: "engines",
    titleEn: "Audio Studio",
    titleDe: "Audio Studio",
    subtitleEn: "Create voiceover scripts and audio briefs for campaigns.",
    subtitleDe: "Erstelle Voiceover-Skripte und Audio-Briefs für Kampagnen.",
    descriptionEn: "Script and voiceover package planner (no provider call).",
    descriptionDe: "Skript- und Voiceover-Paket-Planer (ohne Provider-Call).",
    commandBarBadges: ["Voiceover", "Dialogue Track", "Script Package"],
    implementationType: "mvp",
    workflow: "audio_script",
    outputType: "audio",
    creditCost: 0,
    workspaceKind: "mvp_planner",
  },
  {
    key: "apps",
    href: "/dashboard/apps",
    icon: Workflow,
    labelEn: "Apps / Workflows",
    labelDe: "Apps / Workflows",
    category: "engines",
    titleEn: "Apps / Workflows",
    titleDe: "Apps / Workflows",
    subtitleEn: "Chain tools into reusable campaign workflows.",
    subtitleDe: "Verbinde Tools zu wiederverwendbaren Kampagnen-Workflows.",
    descriptionEn: "Visual workflow planner for multi-step campaigns.",
    descriptionDe: "Visueller Workflow-Planer für Multi-Step-Kampagnen.",
    commandBarBadges: ["Node Workflow", "Multi-Step Pipeline", "Automation"],
    implementationType: "mvp",
    workflow: "apps_workflow",
    outputType: "plan",
    creditCost: 0,
    workspaceKind: "mvp_planner",
  },
  {
    key: "product_photography",
    href: "/dashboard/product-photography",
    icon: ShoppingBag,
    labelEn: "Product Photography",
    labelDe: "Product Photography",
    category: "optional",
    titleEn: "Product Photography",
    titleDe: "Product Photography",
    subtitleEn: "Create clean ecommerce and product campaign visuals.",
    subtitleDe: "Erstelle saubere E-Commerce- und Produktkampagnen-Visuals.",
    descriptionEn: "Product-focused UGC and ecommerce visuals.",
    descriptionDe: "Produktfokussierte UGC- und E-Commerce-Visuals.",
    commandBarBadges: ["Ecommerce", "Product Scene", "Clean Background"],
    implementationType: "krea",
    workflow: "ugc_look",
    outputType: "image",
    creditCost: 2,
    workspaceKind: "studio_image",
    initialImageMode: "ugc_look",
    generateRoute: "/api/generate",
    imageMode: "ugc_look",
  },
  {
    key: "brand_assets",
    href: "/dashboard/brand-assets",
    icon: Package,
    labelEn: "Brand Assets",
    labelDe: "Brand Assets",
    category: "optional",
    titleEn: "Brand Assets",
    titleDe: "Brand Assets",
    subtitleEn: "Generate consistent branded campaign assets.",
    subtitleDe: "Generiere konsistente markenfähige Kampagnenassets.",
    descriptionEn: "Brand-safe product and campaign visuals.",
    descriptionDe: "Markensichere Produkt- und Kampagnenvisuals.",
    commandBarBadges: ["Brand System", "Product Visual", "Campaign Asset"],
    implementationType: "krea",
    workflow: "brand_assets",
    outputType: "image",
    creditCost: 4,
    workspaceKind: "studio_image",
    initialImageMode: "brand_assets",
    generateRoute: "/api/generate",
    imageMode: "brand_assets",
  },
  {
    key: "campaign_builder",
    href: "/dashboard/campaign-builder",
    icon: CalendarDays,
    labelEn: "Campaign Builder",
    labelDe: "Campaign Builder",
    category: "optional",
    titleEn: "Campaign Builder",
    titleDe: "Campaign Builder",
    subtitleEn: "Turn one idea into a complete campaign plan.",
    subtitleDe: "Verwandle eine Idee in einen kompletten Kampagnenplan.",
    descriptionEn: "7-day campaign plan with formats and captions.",
    descriptionDe: "7-Tage-Kampagnenplan mit Formaten und Captions.",
    commandBarBadges: ["7-Day Plan", "Formats", "Captions"],
    implementationType: "mvp",
    workflow: "campaign_plan",
    outputType: "plan",
    creditCost: 0,
    workspaceKind: "mvp_planner",
  },
  {
    key: "style_profiles",
    href: "/dashboard/style-profiles",
    icon: Palette,
    labelEn: "Style Profiles",
    labelDe: "Style Profiles",
    category: "optional",
    titleEn: "Style Profiles",
    titleDe: "Style Profiles",
    subtitleEn: "Save reusable visual styles for consistent campaigns.",
    subtitleDe: "Speichere wiederverwendbare Stile für konsistente Kampagnen.",
    descriptionEn: "Create and apply character/style profiles.",
    descriptionDe: "Erstelle und wende Style-Profile an.",
    commandBarBadges: ["Saved Style", "Consistency", "Reusable Profile"],
    implementationType: "mvp",
    workflow: "style_profiles",
    outputType: "profile",
    creditCost: 0,
    workspaceKind: "style_profiles",
  },
  {
    key: "batch_generator",
    href: "/dashboard/batch-generator",
    icon: Layers3,
    labelEn: "Batch Generator",
    labelDe: "Batch Generator",
    category: "optional",
    titleEn: "Batch Generator",
    titleDe: "Batch Generator",
    subtitleEn: "Plan multi-format variant batches for campaigns.",
    subtitleDe: "Plane Multi-Format-Varianten-Batches für Kampagnen.",
    descriptionEn: "Batch plan with formats and variant prompts.",
    descriptionDe: "Batch-Plan mit Formaten und Varianten-Prompts.",
    commandBarBadges: ["Batch", "Variants", "Multi-Format"],
    implementationType: "mvp",
    workflow: "batch_plan",
    outputType: "plan",
    creditCost: 0,
    workspaceKind: "mvp_planner",
  },
  {
    key: "moodboards",
    href: "/dashboard/moodboards",
    icon: Film,
    labelEn: "Moodboards",
    labelDe: "Moodboards",
    category: "primary",
    titleEn: "Moodboards",
    titleDe: "Moodboards",
    subtitleEn: "Collect inspiration and campaign mood in one board.",
    subtitleDe: "Sammle Inspiration und Kampagnenstimmung auf einem Board.",
    descriptionEn: "Create boards with notes and asset links.",
    descriptionDe: "Erstelle Boards mit Notizen und Asset-Links.",
    commandBarBadges: ["Inspiration", "References", "Campaign Mood"],
    implementationType: "mvp",
    workflow: "moodboard",
    outputType: "moodboard",
    creditCost: 0,
    workspaceKind: "mvp_planner",
  },
  {
    key: "train_lora",
    href: "/dashboard/train",
    icon: Palette,
    labelEn: "Style Training",
    labelDe: "Style Training",
    category: "primary",
    titleEn: "Style Training",
    titleDe: "Style Training",
    subtitleEn: "Train reusable LoRA styles from reference images.",
    subtitleDe: "Trainiere wiederverwendbare LoRA-Stile aus Referenzbildern.",
    descriptionEn: "Style LoRA training workflow (reference images → custom profile).",
    descriptionDe: "Style-LoRA-Training (Referenzbilder → Custom Profile).",
    commandBarBadges: ["References", "Style Lock", "Consistency"],
    implementationType: "mvp",
    workflow: "train_style",
    outputType: "profile",
    creditCost: 0,
    workspaceKind: "style_profiles",
  },
  {
    key: "node_editor",
    href: "/dashboard/nodes",
    icon: Network,
    labelEn: "Node Editor",
    labelDe: "Node Editor",
    category: "primary",
    titleEn: "Node Editor",
    titleDe: "Node Editor",
    subtitleEn: "Run a simple prompt-to-image creative pipeline.",
    subtitleDe: "Starte eine einfache Prompt-zu-Bild-Kreativ-Pipeline.",
    descriptionEn: "Linear node chain ending in image generation.",
    descriptionDe: "Lineare Node-Kette mit Bildgenerierung am Ende.",
    commandBarBadges: ["Prompt", "Image", "Pipeline"],
    implementationType: "mvp",
    workflow: "node_pipeline",
    outputType: "image",
    creditCost: 1,
    workspaceKind: "mvp_planner",
  },
];

export const PRIMARY_NAV_MATRIX = [
  {
    id: "home" as const,
    href: "/dashboard",
    icon: Home,
    labelEn: "Home",
    labelDe: "Start",
    workspaceKind: "home" as const,
  },
  {
    id: "assets" as const,
    href: "/dashboard/assets",
    icon: GalleryVerticalEnd,
    labelEn: "Assets",
    labelDe: "Assets",
    workspaceKind: "assets" as const,
  },
];

export function getMatrixEntry(key: ActiveTool): CreativeToolMatrixEntry | null {
  if (!key) return null;
  return CREATIVE_TOOL_MATRIX.find((t) => t.key === key) ?? null;
}

export function getAllMatrixTools(): CreativeToolMatrixEntry[] {
  return CREATIVE_TOOL_MATRIX;
}

export function getEngineMatrixTools(): CreativeToolMatrixEntry[] {
  return filterActiveMatrixEntries(
    CREATIVE_TOOL_MATRIX.filter((t) => t.category === "engines")
  );
}

export function getOptionalMatrixTools(): CreativeToolMatrixEntry[] {
  return filterActiveMatrixEntries(
    CREATIVE_TOOL_MATRIX.filter((t) => t.category === "optional")
  );
}

export function getActiveKreaPlatformTools(): CreativeToolMatrixEntry[] {
  return CREATIVE_TOOL_MATRIX.filter((t) =>
    KREA_PLATFORM_ACTIVE_TOOLS.has(t.key)
  );
}

export function pathnameToMatrixTool(pathname: string): ActiveTool {
  if (pathname === "/dashboard" || pathname === "/dashboard/home") return null;
  if (pathname.startsWith("/dashboard/moodboards")) return "moodboards";
  if (pathname.startsWith("/dashboard/train")) return "train_lora";
  if (pathname.startsWith("/dashboard/nodes")) return "node_editor";
  if (pathname.startsWith("/dashboard/image")) return "image";
  if (pathname.startsWith("/dashboard/video-restyle")) return "video_restyle";
  if (pathname.startsWith("/dashboard/video")) return "video";
  if (pathname.startsWith("/dashboard/enhancer")) return "enhancer";
  if (pathname.startsWith("/dashboard/edit")) return "edit";
  if (pathname.startsWith("/dashboard/lipsync")) return "lipsync";
  if (pathname.startsWith("/dashboard/motion-transfer")) return "motion_transfer";
  if (pathname.startsWith("/dashboard/3d")) return "3d_objects";
  if (pathname.startsWith("/dashboard/realtime")) return "realtime";
  if (pathname.startsWith("/dashboard/audio")) return "audio";
  if (pathname.startsWith("/dashboard/apps")) return "apps";
  if (pathname.startsWith("/dashboard/product-photography")) return "product_photography";
  if (pathname.startsWith("/dashboard/brand-assets")) return "brand_assets";
  if (pathname.startsWith("/dashboard/campaign-builder")) return "campaign_builder";
  if (pathname.startsWith("/dashboard/style-profiles")) return "style_profiles";
  if (pathname.startsWith("/dashboard/batch-generator")) return "batch_generator";
  return null;
}

export function getCommandBarBadgePills(key: ActiveTool): { id: string; label: string }[] {
  const tool = getMatrixEntry(key);
  if (!tool) return [];
  return tool.commandBarBadges.map((label, index) => ({
    id: `${tool.key}-badge-${index}`,
    label,
  }));
}

export function isToolActive(key: ActiveTool): boolean {
  if (!key) return false;
  return isKreaPlatformToolEnabled(key);
}
