"use client";

import type { StudioCategoryId } from "@/app/lib/studio/studio-categories";

type Tab = {
  id: StudioCategoryId;
  label: string;
};

type Props = {
  tabs: readonly Tab[];
  activeId: StudioCategoryId;
  onSelect: (id: StudioCategoryId) => void;
  ariaLabel: string;
  className?: string;
};

export default function ModelCategoryTabs({
  tabs,
  activeId,
  onSelect,
  ariaLabel,
  className = "",
}: Props) {
  return (
    <div
      className={`flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`model-explorer-tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`model-explorer-panel-${tab.id}`}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition sm:px-3 sm:py-2 sm:text-[11px] ${
              active
                ? "bg-[#d8ad5f]/15 text-[#f5e6c8] ring-1 ring-[#d8ad5f]/35"
                : "text-neutral-400 hover:bg-white/[0.04] hover:text-white"
            }`}
            onClick={() => onSelect(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
