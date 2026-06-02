"use client";

import { useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import {
  getModelsQualityDrawerSections,
  isRunnableModelMode,
  type ClientModelModeView,
} from "@/app/lib/model-modes/get-visible-model-modes";
import { getModeMarketingDescription } from "@/app/lib/model-modes/mode-marketing-copy";
import type { AccessTier } from "@/app/lib/model-modes/types";
import CreditCostBadge, { PremiumBadge } from "./CreditCostBadge";
import ToolDetailPanel from "./ToolDetailPanel";
import {
  resolveCreatorToolForModelMode,
  type ResolvedCreatorTool,
} from "@/app/lib/tools/resolve-tool";
import { getToolStatusLabel } from "@/app/lib/tools/tool-status";
import type { ToolStatus } from "@/app/lib/tools/tool-status";
import { getModelModeDisplayLabel } from "@/app/lib/model-modes/mode-display-label";
import { studioToolStatusBadgeClass } from "@/lib/obsidian/status-badge-classes";

type Props = {
  open: boolean;
  onClose: () => void;
  language?: "en" | "de";
  userPlan?: AccessTier | string | null;
  selectedModelModeId?: string;
  onSelectActive?: (modelModeId: string) => void;
};

function drawerStatusBadgeClass(status: ToolStatus): string {
  return studioToolStatusBadgeClass(status);
}

function ModeRow({
  mode,
  isDe,
  selected,
  onSelectActive,
  onOpenToolDetail,
}: {
  mode: ClientModelModeView;
  isDe: boolean;
  selected: boolean;
  onSelectActive?: (id: string) => void;
  onOpenToolDetail?: (resolved: ResolvedCreatorTool) => void;
}) {
  const lang = isDe ? "de" : "en";
  const resolvedTool = resolveCreatorToolForModelMode(mode, { language: lang });
  const isRunnable = isRunnableModelMode(mode);
  const isDetailTool =
    !isRunnable &&
    resolvedTool != null &&
    (resolvedTool.status === "preview" ||
      resolvedTool.status === "request_access" ||
      resolvedTool.status === "pro_locked");
  const isLocked = !isRunnable && !isDetailTool;
  const marketing = isRunnable
    ? getModeMarketingDescription(mode.id, lang)
    : null;
  const helperText = isLocked
    ? mode.comingSoonReason ?? mode.description
    : isDetailTool
      ? resolvedTool?.reasonIfUnavailable ?? mode.description
      : null;

  const handleSelect = () => {
    if (isDetailTool && resolvedTool) {
      onOpenToolDetail?.(resolvedTool);
      return;
    }
    if (isLocked || !onSelectActive) return;
    onSelectActive(mode.id);
  };

  const statusBadge =
    isDetailTool && resolvedTool
      ? getToolStatusLabel(resolvedTool.status, lang)
      : isDe
        ? "Demnächst"
        : "Coming soon";

  return (
    <div
      role={isLocked ? undefined : "button"}
      tabIndex={isLocked ? undefined : 0}
      onKeyDown={
        isLocked
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect();
              }
            }
      }
      onClick={isLocked ? undefined : handleSelect}
      className={`flex items-start justify-between gap-3 rounded-xl border border-white/[0.08] px-3 py-3 transition-[box-shadow,background-color] ${
        selected && isRunnable
          ? "bg-[#8B5CF6]/8 ring-2 ring-[#8B5CF6]/40 shadow-[0_0_20px_rgba(139,92,246,0.12)]"
          : "bg-[#111827]/60"
      } ${isLocked ? "opacity-70" : "cursor-pointer hover:bg-[#111827]/90"}`}
      aria-disabled={isLocked}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#F9FAFB]">
            {getModelModeDisplayLabel(mode, isDe ? "de" : "en")}
          </span>
          {mode.isPremium ? <PremiumBadge /> : null}
          {!isRunnable ? (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isDetailTool && resolvedTool
                  ? drawerStatusBadgeClass(resolvedTool.status)
                  : "border-white/[0.08] bg-[#0E1220] text-[#9CA3AF]"
              }`}
            >
              {statusBadge}
            </span>
          ) : null}
        </div>
        {marketing ? (
          <div className="mt-1 space-y-0.5">
            <p className="text-xs font-medium text-amber-400/90">
              {marketing.creditTitle}
            </p>
            <p className="line-clamp-2 text-xs text-[#9CA3AF]">
              {marketing.tagline}
            </p>
          </div>
        ) : helperText ? (
          <p className="mt-1 line-clamp-2 text-xs text-[#9CA3AF]">{helperText}</p>
        ) : null}
        {isRunnable ? (
          <div className="mt-2">
            <CreditCostBadge credits={mode.creditCost} />
          </div>
        ) : null}
      </div>
      {isRunnable ? (
        <span
          className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
            selected
              ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-[#C4B5FD]"
              : "border-amber-500/30 text-amber-400"
          }`}
        >
          {selected ? (isDe ? "Aktiv" : "Selected") : isDe ? "Wählen" : "Select"}
        </span>
      ) : isDetailTool ? (
        <span className="shrink-0 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-400">
          {isDe ? "Details" : "Details"}
        </span>
      ) : (
        <span
          className="shrink-0 cursor-not-allowed rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-600"
          aria-hidden
        >
          {isDe ? "Demnächst" : "Coming soon"}
        </span>
      )}
    </div>
  );
}

export function ModelsQualityDrawerTrigger({
  onClick,
  language = "en",
}: {
  onClick: () => void;
  language?: "en" | "de";
}) {
  const isDe = language === "de";
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#111827]/60 px-3 py-1.5 text-xs font-medium text-[#9CA3AF] transition-[box-shadow,color] hover:text-[#F9FAFB] hover:ring-1 hover:ring-[#8B5CF6]/30"
    >
      <SlidersHorizontal className="h-3.5 w-3.5" />
      {isDe ? "Modelle & Qualität" : "Models & Quality"}
    </button>
  );
}

export default function ModelsQualityDrawer({
  open,
  onClose,
  language = "en",
  userPlan,
  selectedModelModeId,
  onSelectActive,
}: Props) {
  const isDe = language === "de";
  const [detailTool, setDetailTool] = useState<ResolvedCreatorTool | null>(null);
  const sections = useMemo(
    () => getModelsQualityDrawerSections(userPlan),
    [userPlan]
  );

  const handleSelectActive = useCallback(
    (modelModeId: string) => {
      const section = sections.find((s) =>
        s.modes.some((m) => m.id === modelModeId)
      );
      const mode = section?.modes.find((m) => m.id === modelModeId);
      if (!mode || !isRunnableModelMode(mode)) return;
      onSelectActive?.(modelModeId);
    },
    [sections, onSelectActive]
  );

  const handleOpenToolDetail = useCallback((resolved: ResolvedCreatorTool) => {
    setDetailTool(resolved);
  }, []);

  return (
    <>
      <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#070A12] shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B5CF6]">
                  {isDe ? "Studio" : "Studio"}
                </p>
                <h2 className="text-lg font-bold text-[#F9FAFB]">
                  {isDe ? "Modelle & Qualität" : "Models & Quality"}
                </h2>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  {isDe
                    ? "Aktive Modi wählen — weitere Tools demnächst."
                    : "Select an active mode — more tools coming soon."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-900 hover:text-white"
                aria-label={isDe ? "Schließen" : "Close"}
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {sections.map((section) => {
                const sectionLabel = section.label[isDe ? "de" : "en"];
                return (
                  <section key={section.id}>
                    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                      {sectionLabel}
                    </h3>
                    <div className="space-y-2">
                      {section.modes.map((mode) => (
                        <ModeRow
                          key={mode.id}
                          mode={mode}
                          isDe={isDe}
                          selected={mode.id === selectedModelModeId}
                          onSelectActive={handleSelectActive}
                          onOpenToolDetail={handleOpenToolDetail}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </motion.aside>
        </>
      ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {detailTool ? (
          <ToolDetailPanel
            key={detailTool.tool.id}
            open
            resolved={detailTool}
            language={language}
            onClose={() => setDetailTool(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
