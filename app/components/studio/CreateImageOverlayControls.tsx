"use client";

import type { ClientModelModeView } from "@/app/lib/model-modes/get-visible-model-modes";
import { getModelModeDisplayLabel } from "@/app/lib/model-modes/mode-display-label";
import type { getCreateImageToolCopy } from "@/app/lib/tools/creator-tools";
import type { StudioFormatId } from "@/lib/dashboard/v2/constants";
import FormatAspectGrid from "@/app/dashboard/components/studio-white/FormatAspectGrid";
import ModelModeSelector from "./ModelModeSelector";
import SelectedModeSummary from "./SelectedModeSummary";
import ModeHelpText from "./ModeHelpText";
import ModelsQualityDrawer, {
  ModelsQualityDrawerTrigger,
} from "./ModelsQualityDrawer";

type Props = {
  language: "en" | "de";
  modelModes: ClientModelModeView[];
  selectedModelModeId: string;
  selectedModelMode?: ClientModelModeView;
  creditCost: number;
  formatId: StudioFormatId;
  onSelectModelMode: (modelModeId: string) => void;
  onFormatChange: (formatId: StudioFormatId) => void;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onUpgradeClick: () => void;
  /** Full-page studio — show tool intro card above modes. */
  showToolIntro?: boolean;
  createImageCopy?: ReturnType<typeof getCreateImageToolCopy> | null;
};

export default function CreateImageOverlayControls({
  language,
  modelModes,
  selectedModelModeId,
  selectedModelMode,
  creditCost,
  formatId,
  onSelectModelMode,
  onFormatChange,
  drawerOpen,
  onDrawerOpenChange,
  onUpgradeClick,
  showToolIntro = false,
  createImageCopy = null,
}: Props) {
  const isDe = language === "de";

  return (
    <div className="space-y-3">
      {showToolIntro && createImageCopy ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0E1220]/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#F9FAFB]">
              {createImageCopy.label}
            </p>
            {creditCost > 0 ? (
              <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {creditCost.toLocaleString(isDe ? "de-DE" : "en-US")}{" "}
                {isDe ? "Credits" : "Credits"}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
            {createImageCopy.description}
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
          {isDe ? "Qualitätsmodus" : "Quality mode"}
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

      <FormatAspectGrid selectedId={formatId} onSelect={onFormatChange} />

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
    </div>
  );
}
