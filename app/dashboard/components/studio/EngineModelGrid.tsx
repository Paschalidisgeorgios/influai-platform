"use client";

import { Check } from "lucide-react";
import type { ModelOption } from "./ModelSelector";

type EngineModelGridProps = {
  options: ModelOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  labelDe?: string;
  labelEn?: string;
  language?: "de" | "en";
  columns?: 1 | 2 | 4;
};

export default function EngineModelGrid({
  options,
  value,
  onChange,
  label,
  labelDe = "Engine",
  labelEn = "Engine",
  language = "en",
  columns = 4,
}: EngineModelGridProps) {
  const resolved = options.length > 0 ? options : [];
  const active =
    resolved.find((o) => o.value === value)?.value ?? resolved[0]?.value ?? "";

  const heading = label ?? (language === "de" ? labelDe : labelEn);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {heading}
      </p>
      <div
        className={`mt-2 grid gap-4 ${
          columns === 1
            ? "grid-cols-1"
            : columns === 4
              ? "grid-cols-2 md:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        }`}
      >
        {resolved.map((option) => {
          const selected = active === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`relative flex h-32 cursor-pointer flex-col items-start justify-between rounded-2xl border bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm ${
                selected
                  ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500"
                  : "border-gray-200"
              }`}
            >
              {selected ? (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
              ) : null}
              <span className="pr-6 text-sm font-bold text-slate-900">
                {option.label}
              </span>
              {option.note ? (
                <span className="line-clamp-3 text-xs font-medium text-slate-600">
                  {option.note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
