"use client";

import { useMemo } from "react";
import {
  Film,
  ImageIcon,
  Megaphone,
  Mic2,
  PenLine,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardLanguage } from "./DashboardLanguageProvider";

const FAST_DRAFT_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_FAST_DRAFT === "true";
const PREMIUM_IMAGE_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_PREMIUM_IMAGE === "true";
const REFERENCE_EDIT_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_REFERENCE_EDIT === "true";
const BRAND_ASSETS_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_BRAND_ASSETS === "true";
const VIDEO_STUDIO_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO === "true";
const LIP_SYNC_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC === "true";

type ModeAvailability = "live" | "beta" | "planned";

type StudioModeRow = {
  id: string;
  label: string;
  credits: string;
  bestFor: string;
  availability: ModeAvailability;
  icon: LucideIcon;
};

function getAvailabilityBadgeClass(availability: ModeAvailability) {
  if (availability === "live") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  }

  if (availability === "beta") {
    return "border-amber-400/25 bg-amber-500/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.04] text-white/45";
}

export default function StudioModesOverview() {
  const { copy } = useDashboardLanguage();
  const s = copy.studioSuite;

  const rows: StudioModeRow[] = useMemo(
    () => [
      {
        id: "standard",
        label: s.modes.standard.label,
        credits: s.modes.standard.credits,
        bestFor: s.modes.standard.bestFor,
        availability: "live",
        icon: ImageIcon,
      },
      {
        id: "fast_draft",
        label: s.modes.fastDraft.label,
        credits: s.modes.fastDraft.credits,
        bestFor: s.modes.fastDraft.bestFor,
        availability: FAST_DRAFT_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Zap,
      },
      {
        id: "premium_image",
        label: s.modes.premium.label,
        credits: s.modes.premium.credits,
        bestFor: s.modes.premium.bestFor,
        availability: PREMIUM_IMAGE_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Sparkles,
      },
      {
        id: "reference_edit",
        label: s.modes.referenceEdit.label,
        credits: s.modes.referenceEdit.credits,
        bestFor: s.modes.referenceEdit.bestFor,
        availability: REFERENCE_EDIT_PUBLIC_ENABLED ? "beta" : "planned",
        icon: PenLine,
      },
      {
        id: "brand_assets",
        label: s.modes.brandAssets.label,
        credits: s.modes.brandAssets.credits,
        bestFor: s.modes.brandAssets.bestFor,
        availability: BRAND_ASSETS_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Megaphone,
      },
      {
        id: "video_studio",
        label: s.modes.videoStudio.label,
        credits: s.modes.videoStudio.credits,
        bestFor: s.modes.videoStudio.bestFor,
        availability: VIDEO_STUDIO_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Film,
      },
      {
        id: "lip_sync",
        label: s.modes.lipSync.label,
        credits: s.modes.lipSync.credits,
        bestFor: s.modes.lipSync.bestFor,
        availability: LIP_SYNC_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Mic2,
      },
    ],
    [s]
  );

  function getAvailabilityLabel(availability: ModeAvailability) {
    if (availability === "live") return copy.sidebar.live;
    if (availability === "beta") return copy.sidebar.beta;
    return copy.sidebar.planned;
  }

  return (
    <section className="mx-auto mb-5 w-full max-w-5xl px-3 sm:mb-6 sm:px-0">
      <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:rounded-[1.5rem]">
        <div className="border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8ad5f]">
            {s.title}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            {s.description}
          </p>
          <p className="mt-2 text-xs font-semibold text-white/35">
            {s.workflowChargeNote}
          </p>
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                <th className="px-5 py-3">{s.tool}</th>
                <th className="px-3 py-3">{s.status}</th>
                <th className="px-3 py-3">{s.creditCost}</th>
                <th className="px-5 py-3">{s.bestFor}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const Icon = row.icon;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.06] last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/55">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-white/85">
                          {row.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] ${getAvailabilityBadgeClass(
                          row.availability
                        )}`}
                      >
                        {getAvailabilityLabel(row.availability)}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-[#d8ad5f]">
                      {row.credits}
                    </td>
                    <td className="px-5 py-3 text-white/50">{row.bestFor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-white/[0.06] sm:hidden">
          {rows.map((row) => {
            const Icon = row.icon;

            return (
              <div key={row.id} className="flex gap-3 px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/55">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-white">{row.label}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] ${getAvailabilityBadgeClass(
                        row.availability
                      )}`}
                    >
                      {getAvailabilityLabel(row.availability)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#d8ad5f]">
                    {row.credits}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-white/40">
                    {row.bestFor}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
