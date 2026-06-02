"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type {
  CreatorToolboxGroupId,
  CreatorToolId,
} from "@/app/lib/tools/creator-tools";
import type { ResolvedCreatorTool } from "@/app/lib/tools/resolve-tool";
import {
  getStudioCategory,
  resolveStudioCategoryTools,
  STUDIO_CATEGORY_COPY,
  type StudioCategoryToolView,
} from "@/app/lib/studio/studio-categories";
import { getToolboxWorkflowRoute } from "@/app/lib/tools/toolbox-workflow-routing";
import {
  CONTEXT_ACTION_BAR,
  CONTEXT_ACTION_DESCRIPTION,
  CONTEXT_ACTION_GRID,
  CONTEXT_ACTION_HEADER,
  CONTEXT_ACTION_HEADER_COPY,
  CONTEXT_ACTION_LIST_ITEM,
  CONTEXT_ACTION_SCROLL_FADE,
  CONTEXT_ACTION_TOOLS_LAYER,
  CONTEXT_ACTION_TOOLS_VIEWPORT,
} from "@/lib/studio/context-action-tokens";
import ContextActionButton from "./ContextActionButton";
import type { ToolboxLaunchResult } from "./CreatorToolbox";

type Props = {
  categoryId: CreatorToolboxGroupId;
  language: "en" | "de";
  selectedToolId?: CreatorToolId | null;
  onSelectTool: (resolved: ResolvedCreatorTool) => void;
  onLaunchTool?: (resolved: ResolvedCreatorTool) => ToolboxLaunchResult;
};

function handleCategoryToolClick(
  view: StudioCategoryToolView,
  onSelectTool: (resolved: ResolvedCreatorTool) => void,
  onLaunchTool?: (resolved: ResolvedCreatorTool) => ToolboxLaunchResult
) {
  const resolved = view.resolved;

  if (view.status === "disabled" || resolved.status === "disabled") {
    return;
  }

  if (onLaunchTool && getToolboxWorkflowRoute(resolved.tool.id)) {
    const result = onLaunchTool(resolved);
    if (result.launched) return;
    if (result.launchContext || !resolved.canRun) {
      onSelectTool(resolved);
      return;
    }
  }

  if (view.canRun && resolved.tool.href) {
    window.location.href = resolved.tool.href;
    return;
  }

  if (!view.canRun) {
    onSelectTool(resolved);
  }
}

export default function ContextActionBar({
  categoryId,
  language,
  selectedToolId = null,
  onSelectTool,
  onLaunchTool,
}: Props) {
  const isDe = language === "de";
  const category = getStudioCategory(categoryId);
  const categoryCopy = STUDIO_CATEGORY_COPY[categoryId];

  const tools = useMemo(
    () => resolveStudioCategoryTools(categoryId, { language }),
    [categoryId, language]
  );

  return (
    <section
      className={CONTEXT_ACTION_BAR}
      aria-label={isDe ? "Kontext-Aktionen" : "Context actions"}
    >
      <div className={CONTEXT_ACTION_HEADER}>
        <div className={CONTEXT_ACTION_HEADER_COPY}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-500/80">
            {isDe ? categoryCopy.labelDe : categoryCopy.labelEn}
          </p>
          <p className={CONTEXT_ACTION_DESCRIPTION}>
            {isDe ? categoryCopy.descriptionDe : categoryCopy.descriptionEn}
          </p>
        </div>
        {category ? (
          <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-semibold text-neutral-400">
            {tools.length}{" "}
            {isDe
              ? tools.length === 1
                ? "Tool"
                : "Tools"
              : tools.length === 1
                ? "tool"
                : "tools"}
          </span>
        ) : null}
      </div>

      <div className={CONTEXT_ACTION_TOOLS_VIEWPORT}>
        <div className={CONTEXT_ACTION_SCROLL_FADE} aria-hidden />
        <motion.div
          key={categoryId}
          className={CONTEXT_ACTION_TOOLS_LAYER}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div
            className={CONTEXT_ACTION_GRID}
            role="list"
            aria-label={
              isDe
                ? `Aktionen: ${categoryCopy.labelDe}`
                : `Actions: ${categoryCopy.labelEn}`
            }
          >
            {tools.map((view) => (
              <div key={view.id} role="listitem" className={CONTEXT_ACTION_LIST_ITEM}>
                <ContextActionButton
                  view={view}
                  language={language}
                  animateEntrance={false}
                  selected={selectedToolId === view.id}
                  onClick={() =>
                    handleCategoryToolClick(view, onSelectTool, onLaunchTool)
                  }
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
