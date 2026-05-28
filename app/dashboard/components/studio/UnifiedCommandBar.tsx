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
};

const containerClass =
  "bg-white border border-gray-200 shadow-xl rounded-2xl p-4 w-full max-w-2xl mx-auto transition-all focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-300";

const inputClass =
  "w-full resize-none bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 text-sm placeholder-gray-400 min-h-[40px] max-h-32 leading-relaxed";

const pillClass =
  "bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed";

const pillActiveClass =
  "bg-orange-50 text-orange-600 hover:bg-orange-50 border border-orange-500 ring-1 ring-orange-500";

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
}: UnifiedCommandBarProps) {
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
      <div className={containerClass} role="group" aria-label={inputAriaLabel}>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          rows={2}
          placeholder={placeholder}
          aria-label={inputAriaLabel}
          className={inputClass}
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
                className={`${pillClass} ${pill.active ? pillActiveClass : ""}`}
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
