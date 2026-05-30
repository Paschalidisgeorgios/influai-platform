"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { WorkspacePreviewState } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { mediaFromPreview } from "@/lib/dashboard/studio-white/preview";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import StudioMediaCanvas from "./StudioMediaCanvas";
import CommandBar from "../obsidian/CommandBar";
import { OBS } from "@/lib/obsidian/dashboard-tokens";

type Pill = { id: string; label: string };

type Props = {
  previewState: WorkspacePreviewState;
  idlePreviewLabel?: string;
  idlePreviewSubtext?: string;
  fallbackPreviewSrc?: string | null;
  fallbackPreviewKind?: "image" | "video";
  /** When true, shows fallbackPreviewSrc while idle (e.g. video studio demo loop) */
  showIdleFallback?: boolean;
  prompt?: string;
  onPromptChange?: (value: string) => void;
  onSubmit?: () => void;
  pills?: Pill[];
  loading?: boolean;
  disabled?: boolean;
  showCommandBar?: boolean;
  submitLabel?: string;
  engineGrid?: ReactNode;
  formatGrid?: ReactNode;
  durationRow?: ReactNode;
  steps?: ReactNode;
  creditMeter?: ReactNode;
  error?: string | null;
  /** Top: prompt → models → formats → preview. Bottom: legacy docked prompt. */
  promptPlacement?: "top" | "bottom";
  /** Guided studio: greeting → command → intent → models → formats → preview */
  layout?: "default" | "guided";
  greetingSlot?: ReactNode;
  commandBox?: ReactNode;
  intentHintSlot?: ReactNode;
};

export default function StudioWhiteToolFrame({
  previewState,
  idlePreviewLabel,
  idlePreviewSubtext,
  fallbackPreviewSrc,
  fallbackPreviewKind = "video",
  showIdleFallback = false,
  prompt,
  onPromptChange,
  onSubmit,
  pills = [],
  loading = false,
  disabled = false,
  showCommandBar = true,
  submitLabel,
  engineGrid,
  formatGrid,
  durationRow,
  steps,
  creditMeter,
  error,
  promptPlacement = "bottom",
  layout = "default",
  greetingSlot,
  commandBox,
  intentHintSlot,
}: Props) {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";
  const { src, kind } = mediaFromPreview(previewState);

  const displaySrc =
    src ??
    (previewState.status === "idle" && showIdleFallback ? fallbackPreviewSrc : null) ??
    null;
  const displayKind = src ? kind : showIdleFallback ? fallbackPreviewKind : kind;
  const isPreviewLoading = previewState.status === "loading";
  const promptFirst = promptPlacement === "top";
  const guided = layout === "guided" && promptFirst;

  const statusMessage =
    previewState.status === "error" ? previewState.message : error ?? null;

  const commandBar = showCommandBar && !commandBox ? (
    <CommandBar
      value={prompt ?? ""}
      onChange={onPromptChange ?? (() => {})}
      onSubmit={onSubmit ?? (() => {})}
      pills={pills}
      loading={loading}
      disabled={disabled}
      submitLabel={submitLabel}
      floating={!promptFirst}
    />
  ) : null;

  const statusAlert = statusMessage ? (
    <div
      role="alert"
      className="mx-auto mt-4 w-full max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium leading-relaxed text-red-300"
    >
      {statusMessage}
    </div>
  ) : null;

  const previewSection = isPreviewLoading ? (
    <div className={`mx-auto flex h-[40vh] w-full max-w-4xl flex-col items-center justify-center ${OBS.glassPad}`}>
      <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      <p className="mt-3 text-sm font-medium text-neutral-400">
        {previewState.message ??
          (isDe ? "Generierung läuft …" : "Generation in progress …")}
      </p>
    </div>
  ) : (
    <StudioMediaCanvas
      src={displaySrc}
      kind={displayKind}
      emptyLabel={idlePreviewLabel}
      emptySubtext={idlePreviewSubtext}
      isDe={isDe}
    />
  );

  if (guided) {
    return (
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-2 pb-10 sm:px-4">
        {greetingSlot ? (
          <section className="w-full text-center">{greetingSlot}</section>
        ) : null}

        {creditMeter ? <div className="mt-4 w-full">{creditMeter}</div> : null}

        {commandBox ? (
          <section aria-label={isDe ? "Prompt" : "Prompt"} className="mt-5 w-full">
            {commandBox}
          </section>
        ) : showCommandBar ? (
          <section aria-label={isDe ? "Prompt" : "Prompt"} className="mt-5 w-full">
            {commandBar}
          </section>
        ) : null}

        {intentHintSlot ? <div className="w-full">{intentHintSlot}</div> : null}

        {statusAlert}

        {engineGrid ? (
          <section aria-label={isDe ? "Engine" : "Engine"} className="mt-8 w-full">
            {engineGrid}
          </section>
        ) : null}

        {formatGrid ? (
          <section aria-label={isDe ? "Format" : "Format"} className="mt-6 w-full">
            {formatGrid}
          </section>
        ) : null}

        {durationRow ? <div className="mt-6 w-full">{durationRow}</div> : null}
        {steps ? <div className="mt-6 w-full max-w-4xl space-y-4">{steps}</div> : null}

        <section
          aria-label={isDe ? "Vorschau" : "Preview"}
          className="mt-6 w-full"
        >
          {previewSection}
        </section>
      </div>
    );
  }

  if (promptFirst) {
    return (
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-2 pb-10 sm:px-4">
        {creditMeter ? <div className="w-full">{creditMeter}</div> : null}

        {showCommandBar ? (
          <section aria-label={isDe ? "Prompt" : "Prompt"} className="mt-5 w-full">
            {commandBar}
          </section>
        ) : null}

        {statusAlert}

        {engineGrid ? (
          <section aria-label={isDe ? "Engine" : "Engine"} className="mt-8 w-full">
            {engineGrid}
          </section>
        ) : null}

        {formatGrid ? (
          <section aria-label={isDe ? "Format" : "Format"} className="mt-6 w-full">
            {formatGrid}
          </section>
        ) : null}

        {durationRow ? <div className="mt-6 w-full">{durationRow}</div> : null}
        {steps ? <div className="mt-6 w-full max-w-4xl space-y-4">{steps}</div> : null}

        <section
          aria-label={isDe ? "Vorschau" : "Preview"}
          className="mt-6 w-full"
        >
          {previewSection}
        </section>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl flex-col items-center px-2 pb-28 sm:px-4 sm:pb-10">
      {creditMeter ? <div className="mb-4 w-full">{creditMeter}</div> : null}
      {previewSection}

      {engineGrid ? <div className="mt-4 w-full">{engineGrid}</div> : null}
      {formatGrid ? <div className="mt-4 w-full">{formatGrid}</div> : null}
      {durationRow ? <div className="mt-4 w-full">{durationRow}</div> : null}
      {steps ? <div className="mt-4 w-full max-w-4xl space-y-4">{steps}</div> : null}

      {showCommandBar ? (
        <div className="mt-auto w-full pt-6">
          {commandBar}
        </div>
      ) : null}

      {statusAlert}
    </div>
  );
}
