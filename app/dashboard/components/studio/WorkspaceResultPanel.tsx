"use client";

import { ImageIcon, Loader2 } from "lucide-react";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

export type WorkspaceResult =
  | {
      type: "image";
      url: string;
      prompt?: string;
      model?: string;
      format?: string;
      credits?: number;
    }
  | {
      type: "video";
      url: string;
      prompt?: string;
      model?: string;
      credits?: number;
    }
  | {
      type: "audio";
      url: string;
      prompt?: string;
      model?: string;
      credits?: number;
    }
  | {
      type: "text";
      content: string;
      sections?: { title: string; content: string }[];
    }
  | null;

export type WorkspacePreviewState =
  | { status: "idle" }
  | { status: "loading"; message?: string }
  | { status: "error"; message: string }
  | { status: "success"; result: WorkspaceResult };

type WorkspaceResultPanelProps = {
  state: WorkspacePreviewState;
  idleLabel?: string;
  className?: string;
};

export default function WorkspaceResultPanel({
  state,
  idleLabel,
  className = "",
}: WorkspaceResultPanelProps) {
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const resolvedIdle =
    idleLabel ??
    (lang === "de" ? "Dein Ergebnis erscheint hier." : "Your result will appear here.");
  const previewTitle = lang === "de" ? "Vorschau" : "Preview";

  return (
    <div
      className={`flex min-h-[420px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {previewTitle}
      </p>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        {state.status === "idle" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-slate-400">
              <ImageIcon size={22} aria-hidden />
            </span>
            <p className="text-sm font-medium text-slate-500">{resolvedIdle}</p>
          </div>
        ) : null}

        {state.status === "loading" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" aria-hidden />
            <p className="text-sm font-medium text-slate-600">
              {state.message ??
                (lang === "de" ? "Generierung läuft …" : "Generating…")}
            </p>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-orange-400" />
            </div>
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
            {state.message}
          </div>
        ) : null}

        {state.status === "success" && state.result ? (
          <SuccessPreview result={state.result} />
        ) : null}
      </div>
    </div>
  );
}

function SuccessPreview({ result }: { result: NonNullable<WorkspaceResult> }) {
  if (result.type === "image") {
    return (
      <div className="space-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.url}
          alt=""
          className="max-h-[min(52vh,480px)] w-full rounded-xl border border-gray-100 object-contain bg-gray-50"
        />
        <MetaLines result={result} />
      </div>
    );
  }

  if (result.type === "video") {
    return (
      <div className="space-y-3">
        <video
          src={result.url}
          controls
          playsInline
          className="max-h-[min(52vh,480px)] w-full rounded-xl border border-gray-100 bg-black object-contain"
        />
        <MetaLines result={result} />
      </div>
    );
  }

  if (result.type === "audio") {
    return (
      <div className="space-y-3">
        <audio src={result.url} controls className="w-full" />
        <MetaLines result={result} />
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto">
      {result.sections?.length ? (
        result.sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-gray-200 bg-gray-50/60 p-4"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {section.title}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-800">
              {section.content}
            </p>
          </div>
        ))
      ) : (
        <p className="whitespace-pre-wrap text-sm font-medium text-slate-800">
          {result.content}
        </p>
      )}
    </div>
  );
}

function MetaLines({
  result,
}: {
  result: {
    prompt?: string;
    model?: string;
    format?: string;
    credits?: number;
  };
}) {
  if (!result.prompt && !result.model && !result.format) return null;
  return (
    <div className="space-y-1 text-xs text-slate-500">
      {result.prompt ? (
        <p>
          <span className="font-bold text-slate-600">Prompt: </span>
          {result.prompt.slice(0, 120)}
          {result.prompt.length > 120 ? "…" : ""}
        </p>
      ) : null}
      {result.model ? (
        <p>
          <span className="font-bold text-slate-600">Model: </span>
          {result.model}
        </p>
      ) : null}
      {result.format ? (
        <p>
          <span className="font-bold text-slate-600">Format: </span>
          {result.format}
        </p>
      ) : null}
    </div>
  );
}
