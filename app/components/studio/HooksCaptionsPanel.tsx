"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Loader2, MessageSquareText } from "lucide-react";
import {
  formatHooksCaptionsForClipboard,
  getHooksCaptionsUiCopy,
  type HooksCaptionsGenerateResponse,
} from "@/app/lib/copy/hooks-captions";
import { sanitizeUserFacingApiError } from "@/lib/env/user-facing-errors";

type Props = {
  prompt: string;
  language?: "en" | "de";
  disabled?: boolean;
  showHeader?: boolean;
  className?: string;
  panelId?: string;
};

function CopyButton({
  text,
  label,
  isDe,
}: {
  text: string;
  label: string;
  isDe: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      disabled={!text.trim()}
      aria-label={label}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.1] bg-[#070A12]/80 px-2 py-1 text-[11px] font-semibold text-neutral-400 transition hover:border-amber-500/35 hover:text-amber-300 disabled:opacity-40"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" aria-hidden />
      ) : (
        <Copy className="h-3 w-3" aria-hidden />
      )}
      {copied ? (isDe ? "Kopiert" : "Copied") : isDe ? "Kopieren" : "Copy"}
    </button>
  );
}

export default function HooksCaptionsPanel({
  prompt,
  language = "en",
  disabled = false,
  showHeader = true,
  className = "",
  panelId = "hooks-captions-panel",
}: Props) {
  const lang = language === "de" ? "de" : "en";
  const isDe = lang === "de";
  const copy = getHooksCaptionsUiCopy(lang);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HooksCaptionsGenerateResponse | null>(
    null
  );

  const canGenerate = prompt.trim().length >= 3 && !disabled && !loading;

  async function runGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/hooks-captions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), language: lang }),
      });
      const data = (await res.json()) as HooksCaptionsGenerateResponse & {
        error?: string;
      };

      if (!res.ok || data.error) {
        setError(
          sanitizeUserFacingApiError(data.error, copy.errorGeneric, lang)
        );
        setResult(null);
        return;
      }

      setResult(data);
    } catch {
      setError(copy.errorGeneric);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const allCopyText = result
    ? formatHooksCaptionsForClipboard(result, lang)
    : "";
  const hooksCopyText = result ? result.hooks.join("\n") : "";
  const captionsCopyText = result ? result.captions.join("\n\n") : "";
  const hashtagsCopyText = result ? result.hashtags.join(" ") : "";

  const generateButton = (
    <button
      type="button"
      onClick={() => void runGenerate()}
      disabled={!canGenerate}
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <MessageSquareText className="h-3.5 w-3.5" aria-hidden />
      )}
      {loading ? copy.generating : copy.generateCta}
    </button>
  );

  return (
    <section
      id={panelId}
      className={`rounded-2xl border border-white/[0.08] bg-[#111827]/50 p-4 sm:p-5 ${className}`}
      aria-labelledby={showHeader ? "hooks-captions-title" : undefined}
    >
      {showHeader ? (
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            <MessageSquareText className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                id="hooks-captions-title"
                className="text-sm font-semibold text-[#F9FAFB]"
              >
                {copy.title}
              </h3>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                {isDe ? "Kostenlos" : "Free"}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#9CA3AF]">
              {copy.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-[#0E1220]/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#F9FAFB]">{copy.title}</p>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
              {isDe ? "Kostenlos" : "Free"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
            {copy.description}
          </p>
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
        {copy.costNote}
      </p>

      <div className="mt-4">{generateButton}</div>

      {error ? (
        <p className="mt-3 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <CopyButton text={allCopyText} label={copy.copyAll} isDe={isDe} />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {copy.hooksLabel}
              </p>
              <CopyButton
                text={hooksCopyText}
                label={copy.copyHooks}
                isDe={isDe}
              />
            </div>
            <ul className="mt-2 space-y-1.5">
              {result.hooks.map((hook) => (
                <li
                  key={hook}
                  className="rounded-lg border border-white/[0.06] bg-[#070A12]/80 px-2.5 py-1.5 text-xs text-white/75"
                >
                  {hook}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {copy.captionsLabel}
              </p>
              <CopyButton
                text={captionsCopyText}
                label={copy.copyCaptions}
                isDe={isDe}
              />
            </div>
            <ul className="mt-2 space-y-1.5">
              {result.captions.map((caption) => (
                <li
                  key={caption}
                  className="rounded-lg border border-white/[0.06] bg-[#070A12]/80 px-2.5 py-1.5 text-xs text-white/75"
                >
                  {caption}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {copy.hashtagsLabel}
              </p>
              <CopyButton
                text={hashtagsCopyText}
                label={copy.copyHashtags}
                isDe={isDe}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {result.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[11px] font-medium text-amber-400/90"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              {copy.platformsLabel}
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {result.platformVariants.map((variant) => (
                <div
                  key={variant.platform}
                  className="rounded-xl border border-[#22D3EE]/20 bg-[#22D3EE]/5 p-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#67E8F9]">
                    {variant.platform}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-neutral-500">
                    Hook
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/80">
                    {variant.hook}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-neutral-500">
                    Caption
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/80">
                    {variant.caption}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <CopyButton
                      text={`${variant.platform}\n${variant.hook}\n\n${variant.caption}`}
                      label={`Copy ${variant.platform}`}
                      isDe={isDe}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
