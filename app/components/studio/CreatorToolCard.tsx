"use client";

import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Box,
  Clapperboard,
  Download,
  Film,
  ImageIcon,
  Layers3,
  Lock,
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
import { motion } from "framer-motion";
import type { CreatorToolId } from "@/app/lib/tools/creator-tools";
import {
  getCreatorToolDescription,
  getCreatorToolLabel,
  type CreatorToolDefinition,
} from "@/app/lib/tools/creator-tools";
import type { ResolvedCreatorTool } from "@/app/lib/tools/resolve-tool";
import { isCreatorToolChipInteractive } from "@/lib/studio/creator-tool-chip-interaction";
import {
  resolveToolStatusMetadata,
  type PublicToolStatus,
} from "@/app/lib/tools/tool-status";
import { PREMIUM_CLASSES, PREMIUM_SPRING } from "@/lib/obsidian/premium-tokens";
import { A11Y } from "@/lib/obsidian/a11y-tokens";
import {
  studioToolReadyBadgeClass,
  studioToolStatusBadgeClass,
} from "@/lib/obsidian/status-badge-classes";

const TOOL_ICONS: Record<CreatorToolId, LucideIcon> = {
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

type Props = {
  resolved: ResolvedCreatorTool;
  language?: "en" | "de";
  index?: number;
  onClick: () => void;
  /** Compact glass cards for secondary Creator Toolbox */
  size?: "default" | "compact";
};

function statusBadge(
  meta: ReturnType<typeof resolveToolStatusMetadata>,
  language: "en" | "de",
  requiredCredits: number
): { label: string; tone: "ready" | "muted" | "accent" | "pro" | "live" } | null {
  const isDe = language === "de";
  const locale = isDe ? "de-DE" : "en-US";
  const publicStatus = meta.publicStatus;

  if (meta.canRun && publicStatus === "live") {
    if (meta.requiresCredits && requiredCredits > 0) {
      const formatted = requiredCredits.toLocaleString(locale);
      const creditPart =
        requiredCredits === 1
          ? isDe
            ? "1 Credit"
            : "1 Credit"
          : isDe
            ? `${formatted} Credits`
            : `${formatted} credits`;
      return { label: creditPart, tone: "live" };
    }
    return {
      label: isDe ? meta.labelDe : meta.labelEn,
      tone: "live",
    };
  }

  switch (publicStatus) {
    case "preview":
      return {
        label: isDe ? meta.labelDe : meta.labelEn,
        tone: "accent",
      };
    case "request_access":
      return {
        label: isDe ? meta.labelDe : meta.labelEn,
        tone: "accent",
      };
    case "coming_soon":
    case "blocked":
      return {
        label: isDe ? meta.labelDe : meta.labelEn,
        tone: "muted",
      };
    case "pro_locked":
      return {
        label: isDe ? meta.labelDe : meta.labelEn,
        tone: "pro",
      };
    case "disabled":
      return {
        label: isDe ? meta.labelDe : meta.labelEn,
        tone: "muted",
      };
    default:
      return null;
  }
}

function badgeClassForTone(
  tone: "ready" | "muted" | "accent" | "pro" | "live",
  publicStatus: PublicToolStatus
): string {
  if (tone === "live" || tone === "ready") return studioToolReadyBadgeClass();
  if (tone === "pro") return studioToolStatusBadgeClass("pro_locked");
  if (tone === "accent") {
    return studioToolStatusBadgeClass(
      publicStatus === "request_access" ? "request_access" : "preview"
    );
  }
  return studioToolStatusBadgeClass("coming_soon");
}

function isInteractive(resolved: ResolvedCreatorTool): boolean {
  const meta = resolveToolStatusMetadata({
    status: resolved.status,
    canRun: resolved.canRun,
    canPreview: resolved.canPreview,
    canShowToUser: resolved.canShowToUser,
    requiresCredits: resolved.requiresCredits,
  });
  return isCreatorToolChipInteractive({
    canRun: resolved.canRun,
    status: meta.publicStatus,
    resolved,
  });
}

function isLockedDominant(meta: ReturnType<typeof resolveToolStatusMetadata>): boolean {
  return (
    meta.publicStatus === "coming_soon" ||
    meta.publicStatus === "blocked" ||
    meta.publicStatus === "disabled"
  );
}

export default function CreatorToolCard({
  resolved,
  language = "en",
  index = 0,
  onClick,
  size = "default",
}: Props) {
  const isDe = language === "de";
  const compact = size === "compact";
  const tool: CreatorToolDefinition = resolved.tool;
  const Icon = TOOL_ICONS[tool.id] ?? Film;
  const label = getCreatorToolLabel(tool, language);
  const description = getCreatorToolDescription(tool, language);
  const meta = resolveToolStatusMetadata({
    status: resolved.status,
    canRun: resolved.canRun,
    canPreview: resolved.canPreview,
    canShowToUser: resolved.canShowToUser,
    requiresCredits: resolved.requiresCredits,
  });
  const badge = statusBadge(meta, language, resolved.requiredCredits);
  const interactive = isInteractive(resolved);
  const isLiveRunnable = meta.canRun && meta.publicStatus === "live";
  const lockedMuted = !interactive || isLockedDominant(meta);

  const badgeClass = badge
    ? badgeClassForTone(badge.tone, meta.publicStatus)
    : studioToolStatusBadgeClass("coming_soon");

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: compact ? 4 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...PREMIUM_SPRING, delay: index * 0.02 }}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      title={description}
      aria-disabled={!interactive}
      aria-label={
        isLiveRunnable
          ? `${label} — ${isDe ? "Live" : "Live"}`
          : `${label} — ${isDe ? meta.labelDe : meta.labelEn}`
      }
      className={`group relative w-full overflow-hidden text-left ${PREMIUM_CLASSES.cardBase} ${
        compact
          ? `rounded-xl ${PREMIUM_CLASSES.glass} p-2.5 sm:p-3`
          : `rounded-2xl bg-[#111827]/90 backdrop-blur-xl p-4`
      } ${
        isLiveRunnable
          ? `${compact ? PREMIUM_CLASSES.cardHoverLift : PREMIUM_CLASSES.cardHoverLift} cursor-pointer ${A11Y.focusRing} ring-1 ring-amber-500/25`
          : interactive
            ? `cursor-pointer ${A11Y.focusRing} ${compact ? "opacity-90 hover:opacity-100" : "opacity-95"} hover:ring-1 hover:ring-white/10`
            : `cursor-not-allowed ${lockedMuted ? "opacity-[0.38] saturate-50" : "opacity-50 saturate-75"}`
      }`}
    >
      <div className={`flex items-start ${compact ? "gap-2" : "gap-3"}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0E1220]/80 transition-colors ${
            compact ? "h-7 w-7" : "h-10 w-10 rounded-xl"
          } ${
            isLiveRunnable
              ? "text-amber-400/90 group-hover:text-amber-300"
              : interactive
                ? "text-[#9CA3AF] group-hover:text-neutral-300"
                : "text-neutral-600"
          }`}
        >
          {meta.publicStatus === "pro_locked" ? (
            <Lock className={compact ? "h-3 w-3" : "h-4 w-4"} aria-hidden />
          ) : (
            <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p
              className={`font-semibold text-[#F9FAFB] ${
                compact ? "text-xs leading-tight" : "text-sm"
              } ${lockedMuted ? "text-neutral-500" : ""}`}
            >
              {label}
            </p>
            {badge && !compact ? (
              <span
                className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}
              >
                {badge.label}
              </span>
            ) : null}
            {badge && compact && isLiveRunnable ? (
              <span
                className={`rounded-full border px-1.5 py-px text-[8px] font-bold uppercase tracking-wider ${badgeClass}`}
              >
                {isDe ? "Live" : "Live"}
              </span>
            ) : null}
          </div>
          {!compact || (interactive && !lockedMuted) ? (
            <p
              className={`mt-0.5 leading-relaxed text-[#9CA3AF] ${
                compact ? "line-clamp-1 text-[10px]" : "line-clamp-2 text-xs"
              } ${lockedMuted ? "text-neutral-600" : ""}`}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}
