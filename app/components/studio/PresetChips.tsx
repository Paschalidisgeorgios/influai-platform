"use client";

import { getPresetsForModelMode } from "@/app/lib/presets/preset-utils";
import { getModeOutputType } from "@/app/lib/model-modes/mode-copy";

type Props = {
  modelModeId: string;
  selectedPresetId?: string | null;
  language?: "en" | "de";
  onSelect: (presetId: string) => void;
  /** When true, show only primary motion presets (Create Motion Video). */
  primaryOnly?: boolean;
  className?: string;
};

export default function PresetChips({
  modelModeId,
  selectedPresetId,
  language = "en",
  onSelect,
  primaryOnly = false,
  className = "",
}: Props) {
  const presets = getPresetsForModelMode(modelModeId, { primaryOnly });
  const isDe = language === "de";
  const outputType = getModeOutputType(modelModeId);

  if (!presets.length) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
        {outputType === "video"
          ? isDe
            ? "Motion-Stil"
            : "Motion style"
          : isDe
            ? "Stil-Presets"
            : "Style presets"}
      </p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = selectedPresetId === preset.id;
          const label = isDe ? preset.label.de : preset.label.en;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={`rounded-full border border-white/10 px-3 py-1 text-xs font-medium transition-[box-shadow,color] hover:shadow-[0_0_14px_rgba(245,158,11,0.1)] ${
                active
                  ? "bg-amber-500/15 text-amber-300 ring-2 ring-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : "bg-white/[0.04] text-white/55 hover:text-white hover:ring-1 hover:ring-amber-500/25"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-neutral-600">
        {isDe
          ? "Presets ergänzen deinen Prompt — nichts wird überschrieben."
          : "Presets append to your prompt — nothing is replaced."}
      </p>
    </div>
  );
}
