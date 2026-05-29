"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

export type CommandBarPill = {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
};

export type UnifiedCommandBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  pills?: CommandBarPill[];
  disabled?: boolean;
  loading?: boolean;
  submitAriaLabel?: string;
  inputAriaLabel?: string;
  className?: string;
  helperText?: string;
  errorText?: string;
  variant?: "light" | "dark";
  maxWidthClass?: string;
};

const THEMES = {
  light: {
    container:
      "bg-white border border-gray-200 shadow-xl rounded-2xl p-4 w-full max-w-3xl mx-auto transition-all focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-300",
    input:
      "w-full resize-none bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 text-sm placeholder-gray-400 min-h-[40px] max-h-32 leading-relaxed",
    pill: "bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed",
    pillActive:
      "bg-orange-50 text-orange-600 hover:bg-orange-50 border border-orange-500 ring-1 ring-orange-500",
    helper: "text-xs text-slate-500",
    error: "text-xs text-red-600",
  },
  dark: {
    container:
      "bg-[#1c1c1f] border border-white/10 shadow-2xl rounded-2xl p-4 w-full max-w-3xl mx-auto transition-all focus-within:ring-2 focus-within:ring-orange-500/25 focus-within:border-orange-500/40",
    input:
      "w-full resize-none bg-transparent border-none focus:ring-0 focus:outline-none text-white text-sm placeholder-white/40 min-h-[40px] max-h-32 leading-relaxed",
    pill: "bg-white/10 hover:bg-white/15 text-white/70 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed",
    pillActive:
      "bg-orange-500/15 text-orange-300 border border-orange-500/40 ring-1 ring-orange-500/50",
    helper: "text-xs text-white/45",
    error: "text-xs text-red-300",
  },
} as const;

const submitClass =
  "bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500 shrink-0";

export default function UnifiedCommandBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Describe what you want to create and press generate...",
  pills = [],
  disabled = false,
  loading = false,
  submitAriaLabel = "Generate",
  inputAriaLabel = "Prompt",
  className = "",
  helperText,
  errorText,
  variant = "light",
  maxWidthClass,
}: UnifiedCommandBarProps) {
  const theme = THEMES[variant];
  const isDisabled = disabled || loading;

  function handleSubmitClick() {
    if (isDisabled) return;
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (isDisabled) return;
    onSubmit();
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`${theme.container} ${maxWidthClass ?? ""}`}
        role="group"
        aria-label={inputAriaLabel}
      >
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          rows={2}
          placeholder={placeholder}
          aria-label={inputAriaLabel}
          className={theme.input}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {pills.map((pill) => (
              <button
                key={pill.id}
                type="button"
                title={pill.title ?? pill.label}
                disabled={isDisabled || pill.disabled}
                onClick={pill.onClick}
                className={`${theme.pill} ${pill.active ? theme.pillActive : ""}`}
              >
                {pill.icon}
                <span>{pill.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isDisabled}
            aria-label={submitAriaLabel}
            aria-busy={loading}
            className={submitClass}
            onClick={handleSubmitClick}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ArrowUp className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {helperText ? (
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-slate-600">
          {helperText}
        </p>
      ) : null}

      {errorText ? (
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs font-medium text-red-600">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
