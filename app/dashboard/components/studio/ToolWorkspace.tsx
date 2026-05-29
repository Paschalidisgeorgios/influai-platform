"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import EngineModelGrid from "./EngineModelGrid";
import FormatPopover from "./FormatPopover";
import ModelSelector, { type ModelOption } from "./ModelSelector";
import SocialFormatSelector from "./SocialFormatSelector";
import WorkspaceResultPanel, {
  type WorkspacePreviewState,
} from "./WorkspaceResultPanel";

export type { ModelOption };

type ToolWorkspaceProps = {
  title: string;
  subtitle: string;
  modelOptions: ModelOption[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  promptText: string;
  onPromptChange: (value: string) => void;
  selectedFormat?: string;
  onFormatChange?: (format: string) => void;
  badges?: string[];
  creditCost?: number;
  availableCredits?: number;
  children?: ReactNode;
  onGenerate: () => void;
  generateDisabled?: boolean;
  loading?: boolean;
  generateLabel?: string;
  promptPlaceholder?: string;
  promptOptional?: boolean;
  showPrompt?: boolean;
  showModelSelect?: boolean;
  embedded?: boolean;
  /** Right column preview state */
  previewState: WorkspacePreviewState;
  idlePreviewLabel?: string;
  generateHint?: string | null;
  /** 4-column engine cards (Image/Video studio) */
  modelGridColumns?: 1 | 2 | 4;
  /** Light format popover instead of horizontal social cards */
  formatVariant?: "social" | "popover";
  modelLabelEn?: string;
  modelLabelDe?: string;
};

const FALLBACK_MODEL: ModelOption = {
  value: "default",
  label: "Standard Engine",
  note: "Campaign-ready generation",
};

export default function ToolWorkspace({
  title,
  subtitle,
  modelOptions,
  selectedModel,
  onModelChange,
  promptText,
  onPromptChange,
  selectedFormat,
  onFormatChange,
  badges = [],
  creditCost,
  availableCredits,
  children,
  onGenerate,
  generateDisabled = false,
  loading = false,
  generateLabel = "Generate",
  promptPlaceholder = "Describe your campaign visual...",
  promptOptional = false,
  showPrompt = true,
  showModelSelect = true,
  embedded = false,
  previewState,
  idlePreviewLabel,
  generateHint,
  modelGridColumns,
  formatVariant = "social",
  modelLabelEn = "Engine",
  modelLabelDe = "Engine",
}: ToolWorkspaceProps) {
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const resolvedModels =
    modelOptions.length > 0 ? modelOptions : [FALLBACK_MODEL];

  const activeModel =
    resolvedModels.find((m) => m.value === selectedModel)?.value ??
    resolvedModels[0]?.value ??
    "default";

  useEffect(() => {
    if (selectedModel !== activeModel) {
      onModelChange(activeModel);
    }
  }, [activeModel, onModelChange, selectedModel]);

  return (
    <section className="relative z-0 w-full min-w-0">
      {!embedded ? (
        <header className="mb-5 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 font-medium text-slate-600">{subtitle}</p>
        </header>
      ) : null}

      {badges.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
            >
              {badge}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <section className="min-w-0 space-y-4">
          <div className="relative z-10 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:p-5">
            {showModelSelect ? (
              modelGridColumns === 4 ? (
                <EngineModelGrid
                  options={resolvedModels}
                  value={activeModel}
                  onChange={onModelChange}
                  language={lang}
                  labelEn={modelLabelEn}
                  labelDe={modelLabelDe}
                  columns={4}
                />
              ) : modelGridColumns === 2 || modelGridColumns === 1 ? (
                <EngineModelGrid
                  options={resolvedModels}
                  value={activeModel}
                  onChange={onModelChange}
                  language={lang}
                  labelEn={modelLabelEn}
                  labelDe={modelLabelDe}
                  columns={modelGridColumns}
                />
              ) : (
                <ModelSelector
                  options={resolvedModels}
                  value={activeModel}
                  onChange={onModelChange}
                  label={lang === "de" ? modelLabelDe : modelLabelEn}
                />
              )
            ) : null}

            {showPrompt ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {promptOptional
                    ? lang === "de"
                      ? "Prompt (optional)"
                      : "Prompt (optional)"
                    : lang === "de"
                      ? "Prompt"
                      : "Prompt"}
                </span>
                <div className="pointer-events-auto mt-2 rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/30">
                  <textarea
                    value={promptText}
                    onChange={(e) => onPromptChange(e.target.value)}
                    rows={4}
                    placeholder={promptPlaceholder}
                    className="w-full min-h-[96px] resize-none border-none bg-transparent text-sm leading-relaxed text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                  />
                </div>
              </label>
            ) : null}

            {onFormatChange && selectedFormat !== undefined ? (
              formatVariant === "popover" ? (
                <FormatPopover
                  value={selectedFormat}
                  onChange={onFormatChange}
                  language={lang}
                />
              ) : (
                <SocialFormatSelector
                  value={selectedFormat}
                  onChange={onFormatChange}
                />
              )
            ) : null}

            {children}

            {generateHint ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                {generateHint}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={onGenerate}
                disabled={generateDisabled || loading}
                className="pointer-events-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                <Sparkles size={16} aria-hidden />
                {loading
                  ? lang === "de"
                    ? "Generierung läuft…"
                    : "Generating…"
                  : generateLabel}
              </button>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {typeof creditCost === "number" ? (
                  <span className="font-bold text-orange-600">
                    {creditCost} Credits
                  </span>
                ) : null}
                {typeof availableCredits === "number" ? (
                  <span className="text-slate-500">
                    {lang === "de"
                      ? `${availableCredits} verfügbar`
                      : `${availableCredits} available`}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <aside className="min-w-0 xl:sticky xl:top-6">
          <WorkspaceResultPanel
            state={previewState}
            idleLabel={idlePreviewLabel}
          />
        </aside>
      </div>
    </section>
  );
}
