"use client";

import {
  CREATE_MOTION_VIDEO_CREDITS,
  type getCreateMotionVideoToolCopy,
} from "@/app/lib/tools/creator-tools";
import type { ClientModelModeView } from "@/app/lib/model-modes/get-visible-model-modes";
import { getModelModeDisplayLabel } from "@/app/lib/model-modes/mode-display-label";
import type { StudioFormatId } from "@/lib/dashboard/v2/constants";
import FormatAspectGrid from "@/app/dashboard/components/studio-white/FormatAspectGrid";
import DurationPills from "@/app/dashboard/components/obsidian/DurationPills";
import ModelModeSelector from "./ModelModeSelector";
import SelectedModeSummary from "./SelectedModeSummary";
import ModeHelpText from "./ModeHelpText";
import PresetChips from "./PresetChips";
import ModelsQualityDrawer, {
  ModelsQualityDrawerTrigger,
} from "./ModelsQualityDrawer";

type DurationOption = { seconds: 5 | 10; credits: number };

type Props = {
  language: "en" | "de";
  modelModes: ClientModelModeView[];
  selectedModelModeId: string;
  selectedModelMode?: ClientModelModeView;
  creditCost: number;
  formatId: StudioFormatId;
  videoDuration: 5 | 10;
  durationOptions: DurationOption[];
  selectedMotionPresetId?: string | null;
  onSelectModelMode: (modelModeId: string) => void;
  onFormatChange: (formatId: StudioFormatId) => void;
  onDurationChange: (seconds: 5 | 10) => void;
  onSelectMotionPreset: (presetId: string) => void;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onUpgradeClick: () => void;
  /** Overlay compose column — motion styles + format only. */
  compact?: boolean;
  showToolIntro?: boolean;
  createMotionVideoCopy?: ReturnType<typeof getCreateMotionVideoToolCopy> | null;
};

export default function CreateMotionVideoOverlayControls({
  language,
  modelModes,
  selectedModelModeId,
  selectedModelMode,
  creditCost,
  formatId,
  videoDuration,
  durationOptions,
  selectedMotionPresetId,
  onSelectModelMode,
  onFormatChange,
  onDurationChange,
  onSelectMotionPreset,
  drawerOpen,
  onDrawerOpenChange,
  onUpgradeClick,
  compact = false,
  showToolIntro = false,
  createMotionVideoCopy = null,
}: Props) {
  const isDe = language === "de";
  const displayCredits = CREATE_MOTION_VIDEO_CREDITS;

  return (
    <div className="space-y-3">
      {showToolIntro && createMotionVideoCopy ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0E1220]/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#F9FAFB]">
              {createMotionVideoCopy.label}
            </p>
            <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {displayCredits.toLocaleString(isDe ? "de-DE" : "en-US")}{" "}
              {isDe ? "Credits" : "Credits"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
            {createMotionVideoCopy.description}
          </p>
        </div>
      ) : null}

      {compact ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            {isDe ? "Kosten pro Render" : "Cost per render"}
          </p>
          <p className="text-sm font-bold text-amber-300">
            {displayCredits.toLocaleString(isDe ? "de-DE" : "en-US")}{" "}
            {isDe ? "Credits" : "Credits"}
          </p>
        </div>
      ) : null}

      {!compact ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
              {isDe ? "Render-Modus" : "Render mode"}
            </p>
            <ModelsQualityDrawerTrigger
              language={language}
              onClick={() => onDrawerOpenChange(true)}
            />
          </div>
          <ModelModeSelector
            modes={modelModes}
            selectedId={selectedModelModeId}
            onSelect={onSelectModelMode}
            language={language}
            onUpgradeClick={onUpgradeClick}
          />
          {selectedModelMode ? (
            <SelectedModeSummary
              modelModeId={selectedModelModeId}
              modeLabel={getModelModeDisplayLabel(selectedModelMode, language)}
              creditCost={creditCost}
              isPremium={selectedModelMode.isPremium}
              language={language}
            />
          ) : null}
          <ModeHelpText modelModeId={selectedModelModeId} language={language} />
        </>
      ) : null}

      <PresetChips
        modelModeId={selectedModelModeId}
        selectedPresetId={selectedMotionPresetId}
        language={language}
        primaryOnly
        onSelect={onSelectMotionPreset}
      />

      <FormatAspectGrid selectedId={formatId} onSelect={onFormatChange} />

      <DurationPills
        value={videoDuration}
        onChange={onDurationChange}
        options={durationOptions}
      />

      {!compact ? (
        <ModelsQualityDrawer
          open={drawerOpen}
          onClose={() => onDrawerOpenChange(false)}
          language={language}
          selectedModelModeId={selectedModelModeId}
          onSelectActive={(id) => {
            onSelectModelMode(id);
            onDrawerOpenChange(false);
          }}
        />
      ) : null}
    </div>
  );
}
