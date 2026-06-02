"use client";

import { isDevUiEnabled } from "@/lib/env/runtime-ui";

type ModelCard = {
  name: string;
  status: string;
  statusClass: string;
  modelId?: string;
  credits?: string;
  pipeline?: string;
  active?: boolean;
};

type WorkspaceModelPanelProps = {
  title: string;
  cards: ModelCard[];
  footer?: string;
  appearance?: "light" | "dark";
};

export function WorkspaceModelPanel({
  title,
  cards,
  footer,
  appearance = "dark",
}: WorkspaceModelPanelProps) {
  const isLight = appearance === "light";

  return (
    <div className="space-y-3">
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.28em] ${
          isLight ? "text-slate-400" : "text-white/35"
        }`}
      >
        {title}
      </p>
      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card.name}
            className={`rounded-xl border p-3 ${
              card.active
                ? "border-[#d8ad5f]/40 bg-amber-50"
                : isLight
                  ? "border-gray-200 bg-gray-50 opacity-90"
                  : "border-white/10 bg-white/[0.03] opacity-75"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-xs font-semibold ${
                  isLight ? "text-slate-900" : "font-black text-white"
                }`}
              >
                {card.name}
              </p>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] ${card.statusClass}`}
              >
                {card.status}
              </span>
            </div>
            {card.modelId && isDevUiEnabled() ? (
              <p
                className={`mt-1.5 font-mono text-[10px] leading-4 ${
                  isLight ? "text-slate-500" : "text-white/35"
                }`}
              >
                {card.modelId}
              </p>
            ) : null}
            {card.credits ? (
              <p className="mt-1 text-[10px] font-bold text-amber-700">{card.credits}</p>
            ) : null}
            {card.pipeline ? (
              <p
                className={`mt-1 text-[10px] leading-4 ${
                  isLight ? "text-slate-500" : "text-white/45"
                }`}
              >
                {card.pipeline}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {footer ? (
        <p className={`text-[10px] leading-4 ${isLight ? "text-slate-500" : "text-white/35"}`}>
          {footer}
        </p>
      ) : null}
    </div>
  );
}
