"use client";

import type { LucideIcon } from "lucide-react";
import type { CreatorToolboxGroupId } from "@/app/lib/tools/creator-tools";

const GROUP_ACCENT: Record<
  CreatorToolboxGroupId,
  { border: string; iconBg: string; iconText: string }
> = {
  create: {
    border: "border-amber-500/50",
    iconBg: "bg-amber-500/12",
    iconText: "text-amber-300",
  },
  edit: {
    border: "border-[#8B5CF6]/45",
    iconBg: "bg-[#8B5CF6]/12",
    iconText: "text-[#C4B5FD]",
  },
  animate: {
    border: "border-[#22D3EE]/40",
    iconBg: "bg-[#22D3EE]/10",
    iconText: "text-[#67E8F9]",
  },
  train: {
    border: "border-emerald-500/40",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-300",
  },
  optimize: {
    border: "border-amber-500/35",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-200",
  },
  advanced: {
    border: "border-white/15",
    iconBg: "bg-white/[0.06]",
    iconText: "text-neutral-300",
  },
};

type Props = {
  groupId: CreatorToolboxGroupId;
  label: string;
  description: string;
  icon: LucideIcon;
  toolCount: number;
  toolCountLabel: string;
  compact?: boolean;
};

export default function CreatorToolboxGroupHeader({
  groupId,
  label,
  description,
  icon: Icon,
  toolCount,
  toolCountLabel,
  compact = false,
}: Props) {
  const accent = GROUP_ACCENT[groupId];

  return (
    <div
      className={`border-b border-white/[0.06] ${compact ? "mb-3 pb-2.5" : "mb-4 pb-3.5"}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-xl border ${accent.border} ${accent.iconBg} ${compact ? "h-8 w-8" : "h-9 w-9"}`}
        >
          <Icon
            className={`${accent.iconText} ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`}
            aria-hidden
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3
              className={`font-bold tracking-tight text-[#F9FAFB] ${compact ? "text-xs uppercase tracking-[0.12em]" : "text-sm sm:text-base"}`}
            >
              {label}
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
              {toolCount} {toolCountLabel}
            </span>
          </div>
          <p
            className={`mt-1 leading-relaxed text-neutral-500 ${compact ? "text-[11px]" : "text-xs sm:text-sm"}`}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
