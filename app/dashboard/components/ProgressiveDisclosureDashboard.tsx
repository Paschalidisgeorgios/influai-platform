"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ObsidianIntelligentStudio from "./obsidian/ObsidianIntelligentStudio";
import GeneratorOverlay from "@/app/components/studio/GeneratorOverlay";
import GeneratorOverlayHeader from "@/app/components/studio/GeneratorOverlayHeader";
import DashboardToolHome, {
  type DashboardToolSelectPayload,
} from "@/app/components/studio/DashboardToolHome";
import ToolDetailPanel from "@/app/components/studio/ToolDetailPanel";
import {
  getCreatorToolLabel,
  type CreatorToolId,
} from "@/app/lib/tools/creator-tools";
import { buildStudioCategoryToolView } from "@/app/lib/studio/studio-categories";
import {
  formatDashboardCreditsBadge,
  getDashboardStatusBadgeLabel,
} from "@/lib/studio/dashboard-tool-badges";
import { useLanguage } from "@/hooks/useLanguage";
import { useStudioUpsell } from "./studio-white/StudioUpsellProvider";

type OverlayMode = "generator" | "detail" | null;

export default function ProgressiveDisclosureDashboard() {
  const { language } = useLanguage();
  const lang = language === "de" ? "de" : "en";
  const { openUpsell } = useStudioUpsell();
  const openerRef = useRef<HTMLElement | null>(null);

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);
  const [activeToolId, setActiveToolId] = useState<CreatorToolId | null>(null);
  const [detailPayload, setDetailPayload] =
    useState<DashboardToolSelectPayload | null>(null);
  const [detailLaunchContext, setDetailLaunchContext] = useState<string | null>(
    null
  );
  const [draftIdea, setDraftIdea] = useState("");
  const [overlayInitialPrompt, setOverlayInitialPrompt] = useState("");

  const captureOpenTrigger = useCallback((element: HTMLElement) => {
    openerRef.current = element;
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setOverlayOpen(open);
    if (!open) {
      setOverlayMode(null);
      setActiveToolId(null);
      setDetailPayload(null);
      setDetailLaunchContext(null);
    }
  }, []);

  const handleSelectTool = useCallback((payload: DashboardToolSelectPayload) => {
    if (payload.mode === "navigate") {
      return;
    }

    setActiveToolId(payload.toolId);
    setDetailPayload(payload.mode === "detail" ? payload : null);
    setOverlayMode(payload.mode === "detail" ? "detail" : "generator");
    setDetailLaunchContext(null);
    setOverlayInitialPrompt(payload.draftIdea?.trim() ?? "");
    setOverlayOpen(true);
  }, []);

  const detailToolView = useMemo(() => {
    if (!detailPayload) return null;
    return buildStudioCategoryToolView(
      detailPayload.resolved,
      detailPayload.resolved.tool.toolboxGroup,
      lang
    );
  }, [detailPayload, lang]);

  const detailHeaderCost = detailToolView
    ? formatDashboardCreditsBadge(detailToolView, lang)
    : null;

  const detailHeaderStatus = detailHeaderCost
    ? null
    : detailToolView
      ? getDashboardStatusBadgeLabel(detailToolView.status, lang)
      : null;

  const detailOverlayTitle = useMemo(() => {
    if (!detailPayload) {
      return lang === "de" ? "Tool" : "Tool";
    }
    return getCreatorToolLabel(detailPayload.resolved.tool, lang);
  }, [detailPayload, lang]);

  return (
    <>
      <DashboardToolHome
        language={lang}
        draftIdea={draftIdea}
        onDraftIdeaChange={setDraftIdea}
        onSelectTool={handleSelectTool}
        onCaptureOpenTrigger={captureOpenTrigger}
      />

      {overlayOpen && overlayMode === "generator" && activeToolId ? (
        <ObsidianIntelligentStudio
          overlayMode
          initialToolId={activeToolId}
          initialPrompt={overlayInitialPrompt}
          returnFocusRef={openerRef}
          onOverlayClose={() => handleOpenChange(false)}
        />
      ) : null}

      {overlayOpen && overlayMode === "detail" && detailPayload ? (
        <GeneratorOverlay
          open={overlayOpen}
          onOpenChange={handleOpenChange}
          language={lang}
          returnFocusRef={openerRef}
          header={
            <GeneratorOverlayHeader
              toolName={detailOverlayTitle}
              toolId={detailPayload.toolId}
              language={lang}
              costLabel={detailHeaderCost}
              statusLabel={detailHeaderStatus}
              statusTone={detailToolView?.status ?? "preview"}
              onClose={() => handleOpenChange(false)}
            />
          }
        >
          <ToolDetailPanel
            open
            embedded
            simpleOverlay
            resolved={detailPayload.resolved}
            language={lang}
            launchContext={detailLaunchContext}
            onClose={() => handleOpenChange(false)}
            onUpgrade={() =>
              openUpsell({
                balance: 0,
                requiredCredits: 0,
                isPremium: true,
              })
            }
          />
        </GeneratorOverlay>
      ) : null}
    </>
  );
}
