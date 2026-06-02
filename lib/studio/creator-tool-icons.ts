import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Box,
  Clapperboard,
  Download,
  Film,
  ImageIcon,
  Layers3,
  MessageSquareText,
  Mic2,
  Package,
  Palette,
  RefreshCw,
  Scissors,
  Sparkles,
  Star,
  UserRound,
  Video,
  Wand2,
  ZoomIn,
} from "lucide-react";
import type { CreatorToolId } from "@/app/lib/tools/creator-tools";

export const CREATOR_TOOL_ICONS: Record<CreatorToolId, LucideIcon> = {
  create_image: ImageIcon,
  create_video: Video,
  social_asset_pack: Package,
  create_style_variant: Palette,
  improve_prompt: Wand2,
  check_creative_score: Star,
  export_asset: Download,
  hooks_captions: MessageSquareText,
  export_pack: Layers3,
  animate_image: Clapperboard,
  lipsync_creator: Mic2,
  ai_avatar: UserRound,
  enhance_asset: Sparkles,
  background_remove: Scissors,
  upscale_image: ZoomIn,
  object_3d: Box,
  motion_transfer: RefreshCw,
  audio_sound_design: AudioLines,
  use_reference_image: ImageIcon,
  edit_image: Wand2,
  match_style: Palette,
  train_creator_style: Sparkles,
  train_brand_kit: Package,
  train_product_model: Box,
  train_creator_identity: UserRound,
};

export function getCreatorToolIcon(toolId: CreatorToolId): LucideIcon {
  return CREATOR_TOOL_ICONS[toolId] ?? Film;
}
