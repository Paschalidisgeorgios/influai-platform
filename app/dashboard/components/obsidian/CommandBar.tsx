"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import { TYPEWRITER_PLACEHOLDERS } from "@/lib/dashboard/studio-white/placeholders";
import { useLanguage } from "@/hooks/useLanguage";
import ShockwaveButton from "./ShockwaveButton";

type Pill = { id: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
  submitLabel?: string;
  pills?: Pill[];
  /** Slot above the prompt row — e.g. duration pills */
  headerSlot?: ReactNode;
  /** Sticky dock at viewport bottom on mobile */
  floating?: boolean;
  className?: string;
  /** Nested inside SmartCommandBox — no extra glass shell */
  embedded?: boolean;
  autoFocus?: boolean;
  /** Override default image-studio typewriter prompts */
  typewriterPlaceholders?: readonly string[];
  /** Static placeholder (create page) */
  placeholder?: string;
  /** Hide generate/submit button (e.g. pack workflow uses its own CTAs) */
  hideSubmit?: boolean;
  /** Typewriter prompt ghost — generator overlay only */
  enableTypewriterGhost?: boolean;
};

const TYPE_MS = 70;
const DELETE_MS = 30;
const PAUSE_MS = 2500;

export default function CommandBar({
  value,
  onChange,
  onSubmit,
  loading = false,
  disabled = false,
  submitLabel,
  pills = [],
  headerSlot,
  floating = true,
  className = "",
  embedded = false,
  autoFocus = false,
  typewriterPlaceholders,
  placeholder,
  hideSubmit = false,
  enableTypewriterGhost = false,
}: Props) {
  const { language, isDe } = useLanguage();
  const placeholders =
    typewriterPlaceholders ??
    (isDe ? TYPEWRITER_PLACEHOLDERS.de : TYPEWRITER_PLACEHOLDERS.en);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [display, setDisplay] = useState("");
  const [focused, setFocused] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const indexRef = useRef(0);
  const displayRef = useRef("");
  const focusedRef = useRef(false);
  const deletingRef = useRef(false);

  useEffect(() => {
    focusedRef.current = focused;
  }, [focused]);
  useEffect(() => {
    deletingRef.current = deleting;
  }, [deleting]);
  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    if (!autoFocus || floating) return;
    textareaRef.current?.focus({ preventScroll: true });
  }, [autoFocus, floating]);

  useEffect(() => {
    if (!enableTypewriterGhost || placeholder || focused || value.trim().length > 0) {
      if (!enableTypewriterGhost) {
        displayRef.current = "";
        setDisplay("");
      }
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled || focusedRef.current) return;
      const target = placeholders[indexRef.current] ?? "";
      const current = displayRef.current;

      if (!deletingRef.current) {
        if (current.length < target.length) {
          const next = target.slice(0, current.length + 1);
          displayRef.current = next;
          setDisplay(next);
          timeout = setTimeout(tick, TYPE_MS);
          return;
        }
        timeout = setTimeout(() => {
          if (!cancelled && !focusedRef.current) setDeleting(true);
          tick();
        }, PAUSE_MS);
        return;
      }

      if (current.length > 0) {
        const next = current.slice(0, -1);
        displayRef.current = next;
        setDisplay(next);
        timeout = setTimeout(tick, DELETE_MS);
        return;
      }

      setDeleting(false);
      indexRef.current = (indexRef.current + 1) % placeholders.length;
      timeout = setTimeout(tick, TYPE_MS);
    };

    timeout = setTimeout(tick, TYPE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [enableTypewriterGhost, focused, value, placeholders, placeholder]);

  const showTypewriter =
    enableTypewriterGhost && !placeholder && !focused && value.length === 0;
  const showPlaceholder = showTypewriter;
  const staticPlaceholder = placeholder && !value.length;
  const submitDisabled = disabled || loading;

  const dockClass = floating
    ? "sticky bottom-3 z-30 mx-auto w-full max-w-3xl sm:bottom-6"
    : "mx-auto w-full max-w-3xl";

  const shell = (
    <div
      className={
        embedded
          ? "relative overflow-hidden"
          : `relative overflow-hidden ${OBS.glassFloat}`
      }
    >
        {/* Amber laser accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-8 bg-gradient-to-b from-amber-500/10 to-transparent"
        />

        <div className="relative p-4 sm:p-5">
          {headerSlot ? <div className="mb-4 border-b border-neutral-800/60 pb-4">{headerSlot}</div> : null}

          <div
            className={`relative min-h-[140px] max-h-[140px] rounded-xl transition-[box-shadow] duration-300 ${
              focused
                ? enableTypewriterGhost
                  ? "ring-2 ring-amber-500/30 shadow-[inset_0_0_30px_rgba(245,158,11,0.08)]"
                  : "ring-2 ring-[#8B5CF6]/25 shadow-[inset_0_0_30px_rgba(139,92,246,0.06)]"
                : "ring-2 ring-transparent"
            }`}
          >
            {showPlaceholder ? (
              <p className="pointer-events-none absolute inset-0 z-0 px-0.5 text-base leading-relaxed text-[#9CA3AF] sm:text-lg">
                {display}
                <span
                  className={`ml-0.5 inline-block h-4 w-0.5 animate-pulse align-middle ${
                    enableTypewriterGhost ? "bg-amber-500" : "bg-[#8B5CF6]"
                  }`}
                />
              </p>
            ) : null}
            {staticPlaceholder ? (
              <p className="pointer-events-none absolute inset-0 z-0 px-0.5 text-base leading-relaxed text-[#9CA3AF] sm:text-lg">
                {placeholder}
              </p>
            ) : null}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!submitDisabled && !hideSubmit) onSubmit();
                }
              }}
              disabled={loading}
              rows={4}
              className="relative z-10 h-[140px] min-h-[140px] max-h-[140px] w-full resize-none overflow-y-auto border-none bg-transparent text-base text-[#F9FAFB] caret-[#8B5CF6] outline-none placeholder:text-transparent sm:text-lg"
              aria-label={isDe ? "Prompt" : "Prompt"}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {pills.map((pill) => (
                <span
                  key={pill.id}
                  className="rounded-full border border-white/[0.08] bg-[#111827]/80 px-3 py-1 text-[11px] font-medium text-[#9CA3AF] sm:text-xs"
                >
                  {pill.label}
                </span>
              ))}
            </div>
            {!hideSubmit ? (
              submitLabel ? (
                <ShockwaveButton
                  disabled={submitDisabled}
                  onClick={() => onSubmit()}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isDe ? "Läuft…" : "Running…"}
                    </>
                  ) : (
                    <>
                      {submitLabel}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </ShockwaveButton>
              ) : (
                <ShockwaveButton
                  disabled={submitDisabled}
                  onClick={() => onSubmit()}
                  className="w-full p-2.5 sm:w-auto"
                  aria-label={isDe ? "Generieren" : "Generate"}
                >
                  {loading ? (
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="mx-auto h-5 w-5" />
                  )}
                </ShockwaveButton>
              )
            ) : null}
          </div>
        </div>
      </div>
  );

  if (embedded) {
    return <div className={className}>{shell}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={OBS_SPRING}
      className={`${dockClass} ${className}`}
    >
      {shell}

      <p className={`mt-2 hidden text-center sm:block ${OBS.mono} text-neutral-700`}>
        {language === "de" ? "ENTER · SENDEN" : "ENTER · SUBMIT"} ·{" "}
        {language === "de" ? "SHIFT+ENTER · NEUE ZEILE" : "SHIFT+ENTER · NEW LINE"}
      </p>
    </motion.div>
  );
}
