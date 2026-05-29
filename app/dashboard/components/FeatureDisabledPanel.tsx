"use client";

import { Sparkles } from "lucide-react";
import { FEATURE_DISABLED_MESSAGE } from "@/lib/launch/messages";

type FeatureDisabledPanelProps = {
  title: string;
  description?: string;
  variant?: "disabled";
};

export default function FeatureDisabledPanel({
  title,
  description,
  variant = "disabled",
}: FeatureDisabledPanelProps) {
  const headline = FEATURE_DISABLED_MESSAGE;

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Sparkles className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {headline}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}
