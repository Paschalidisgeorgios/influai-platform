"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useSubtleParallax } from "@/lib/motion/use-subtle-parallax";
import DashboardHomeParallaxBackdrop from "./DashboardHomeParallaxBackdrop";
import {
  getDashboardCategoryLabel,
  getDashboardCommandCopy,
} from "@/lib/studio/dashboard-command-copy";
import {
  STUDIO_CATEGORY_ORDER,
  resolveStudioCategoryTools,
  type StudioCategoryId,
} from "@/app/lib/studio/studio-categories";
import type { CreatorToolId } from "@/app/lib/tools/creator-tools";
import { shouldOpenNonLiveToolDetailOverlay } from "@/app/lib/tools/non-live-tool-overlay";
import {
  resolveCreatorTool,
  type ResolvedCreatorTool,
} from "@/app/lib/tools/resolve-tool";
import {
  hasSafeToolboxWorkflow,
  isToolboxRoutedTool,
} from "@/app/lib/tools/toolbox-workflow-routing";
import DashboardToolChip from "./DashboardToolChip";

export type DashboardToolSelectPayload = {
  toolId: CreatorToolId;
  resolved: ResolvedCreatorTool;
  mode: "generator" | "detail" | "navigate";
  href?: string;
  draftIdea?: string;
};

type Props = {
  language: "en" | "de";
  draftIdea: string;
  onDraftIdeaChange: (value: string) => void;
  onSelectTool: (payload: DashboardToolSelectPayload) => void;
  /** Remember the tool control that opened the generator (focus restore). */
  onCaptureOpenTrigger?: (element: HTMLElement) => void;
  className?: string;
};

export default function DashboardToolHome({
  language,
  draftIdea,
  onDraftIdeaChange,
  onSelectTool,
  onCaptureOpenTrigger,
  className = "",
}: Props) {
  const router = useRouter();
  const copy = getDashboardCommandCopy(language);
  const [categoryId, setCategoryId] = useState<StudioCategoryId>("create");
  const reduceMotion = useReducedMotion();
  const { containerRef, getLayerStyle, enabled } = useSubtleParallax<HTMLDivElement>({
    maxPx: 12,
    strength: 1,
    disabled: Boolean(reduceMotion),
  });

  const categoryTabs = useMemo(
    () =>
      STUDIO_CATEGORY_ORDER.map((id) => ({
        id,
        label: getDashboardCategoryLabel(id, language),
      })),
    [language]
  );

  const categoryTools = useMemo(
    () => resolveStudioCategoryTools(categoryId, { language }),
    [categoryId, language]
  );

  const handleToolClick = useCallback(
    (resolved: ResolvedCreatorTool, trigger: HTMLButtonElement) => {
      onCaptureOpenTrigger?.(trigger);
      const idea = draftIdea.trim() || undefined;

      if (
        resolved.canRun &&
        isToolboxRoutedTool(resolved.tool.id) &&
        hasSafeToolboxWorkflow(resolved.tool.id)
      ) {
        onSelectTool({
          toolId: resolved.tool.id,
          resolved,
          mode: "generator",
          draftIdea: idea,
        });
        return;
      }

      if (resolved.canRun && resolved.tool.href) {
        onSelectTool({
          toolId: resolved.tool.id,
          resolved,
          mode: "navigate",
          href: resolved.tool.href,
          draftIdea: idea,
        });
        router.push(resolved.tool.href);
        return;
      }

      if (shouldOpenNonLiveToolDetailOverlay(resolved)) {
        onSelectTool({
          toolId: resolved.tool.id,
          resolved,
          mode: "detail",
          draftIdea: idea,
        });
        return;
      }
    },
    [draftIdea, onCaptureOpenTrigger, onSelectTool, router]
  );

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden ${className}`}
    >
      <div
        ref={containerRef}
        className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-2 py-4 sm:px-4"
      >
        <DashboardHomeParallaxBackdrop
          getLayerStyle={getLayerStyle}
          enabled={enabled}
        />

        <div className="relative z-[1] flex w-full max-w-2xl flex-col items-center gap-5 sm:gap-6">
          <h1 className="text-center text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-3xl">
            {copy.headline}
          </h1>

          <label className="relative w-full">
            <span className="sr-only">{copy.promptLabel}</span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-amber-500/[0.14] blur-2xl"
            />
            <textarea
              value={draftIdea}
              onChange={(event) => onDraftIdeaChange(event.target.value)}
              rows={3}
              placeholder={copy.promptPlaceholder}
              className="relative w-full resize-none rounded-2xl border border-white/[0.14] bg-neutral-950/70 px-5 py-4 text-center text-base leading-relaxed text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl placeholder:text-neutral-500 transition-[border-color,box-shadow] duration-200 focus:border-amber-400/55 focus:outline-none focus:shadow-[0_0_0_1px_rgba(251,191,36,0.35),0_0_28px_rgba(245,158,11,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] focus:ring-0 sm:text-lg sm:leading-relaxed"
            />
          </label>

          <div
            className="flex w-full max-w-2xl flex-nowrap justify-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={language === "de" ? "Kategorien" : "Categories"}
          >
            {categoryTabs.map((tab) => {
              const active = tab.id === categoryId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition-all duration-200 sm:px-3 sm:text-[10px] ${
                    active
                      ? "border-amber-500/55 bg-amber-500/14 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.28)] [text-shadow:0_0_12px_rgba(251,191,36,0.45)]"
                      : "border-transparent bg-white/[0.03] text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200"
                  }`}
                  onClick={() => setCategoryId(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            className="grid w-full max-w-[960px] grid-cols-[repeat(auto-fill,minmax(260px,1fr))] justify-center gap-2.5"
            aria-label={
              language === "de" ? "Tools in Kategorie" : "Tools in category"
            }
          >
            {categoryTools.map((view) => (
              <DashboardToolChip
                key={view.id}
                view={view}
                language={language}
                onClick={(trigger) => {
                  const resolved = resolveCreatorTool(view.id, { language });
                  if (resolved) handleToolClick(resolved, trigger);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
