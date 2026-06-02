"use client";

import type { StudioCategoryToolView } from "@/app/lib/studio/studio-categories";
import {
  formatLandingCreditsLine,
  getLandingToolBenefit,
  getLandingToolStatusLabel,
  getOutputTypeLabel,
  type LandingLanguage,
} from "@/lib/landing/model-explorer";
import { studioDashboardStatusBadgeClass } from "@/lib/obsidian/status-badge-classes";

type Props = {
  view: StudioCategoryToolView;
  language: LandingLanguage;
  index?: number;
};

export default function ModelCapabilityCard({
  view,
  language,
}: Props) {
  const benefit = getLandingToolBenefit(view, language);
  const outputLabel = getOutputTypeLabel(view.resolved.tool.outputType, language);
  const statusLabel = getLandingToolStatusLabel(view, language);
  const creditsLine = formatLandingCreditsLine(view, language);
  const isDe = language === "de";

  return (
    <article className="rounded-xl border border-white/[0.07] bg-[#0c0f14]/80 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-xs font-semibold leading-snug text-white sm:text-[13px]">
          {view.label}
        </h3>
        <span
          className={studioDashboardStatusBadgeClass(view.status)}
          title={statusLabel}
        >
          {statusLabel}
        </span>
      </div>

      <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-400">
        {benefit}
      </p>

      <dl className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-neutral-500">
        <div className="inline-flex items-center gap-1">
          <dt className="sr-only">
            {isDe ? "Ausgabetyp" : "Output type"}
          </dt>
          <dd className="font-medium text-neutral-400">{outputLabel}</dd>
        </div>
        {creditsLine ? (
          <>
            <span className="text-neutral-700" aria-hidden>
              ·
            </span>
            <div className="inline-flex items-center gap-1">
              <dt className="sr-only">{isDe ? "Credits" : "Credits"}</dt>
              <dd>{creditsLine}</dd>
            </div>
          </>
        ) : null}
      </dl>
    </article>
  );
}
