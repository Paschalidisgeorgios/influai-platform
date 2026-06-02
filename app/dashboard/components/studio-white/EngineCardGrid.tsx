"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import type { ModelOption } from "@/lib/dashboard/workspace-types";
import type { ModelAvailability } from "@/lib/ai/krea-model-registry";
import {
  getEngineModelById,
  isEnginePlanLimitedModel,
  kreaPlanLimitUserMessage,
} from "@/lib/ai/model-registry";
import { modelAvailabilityState } from "@/lib/dashboard/studio-white/model-availability";
import type { WhiteLabelEngineCard } from "@/lib/dashboard/white-label-engines";
import { useLanguage } from "@/hooks/useLanguage";
import {
  filterPickerCatalog,
  PICKER_CATEGORY_TABS,
  type KreaPickerCategoryTab,
} from "@/lib/dashboard/krea-model-picker-catalog";

type EngineGridItem = ModelOption | WhiteLabelEngineCard;

type FilterTab =
  | "all"
  | "recommended"
  | "image"
  | "experimental"
  | "not_connected";

type Props = {
  engines: EngineGridItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Use registry category tabs (Recommended, Image, Video, …) */
  registryTabs?: boolean;
  /** Motion Transfer: hide Image tab; show not_configured engines by default */
  motionOnlyTabs?: boolean;
};

function normalizeEngine(engine: EngineGridItem, isDe: boolean): ModelOption {
  if ("value" in engine) {
    return engine;
  }

  return {
    value: engine.id,
    label: isDe ? engine.labelDe : engine.labelEn,
    note: isDe ? engine.descriptionDe : engine.descriptionEn,
    disabled: false,
    availability: "active",
  };
}

function unavailableEngineMessage(
  engine: ModelOption,
  isDe: boolean
): string {
  const entry = getEngineModelById(engine.value);
  if (entry && isEnginePlanLimitedModel(entry)) {
    return kreaPlanLimitUserMessage(isDe ? "de" : "en");
  }
  return isDe ? "Demnächst verfügbar." : "Coming soon.";
}

function cardClassName(
  availability: ModelAvailability | undefined,
  selected: boolean,
  isUnavailable: boolean
): string {
  if (selected) {
    return OBS.engineActive;
  }
  if (isUnavailable) {
    return "cursor-not-allowed border border-white/[0.08] bg-neutral-950/30 opacity-40";
  }
  if (availability === "experimental") {
    return "border border-white/[0.08] bg-neutral-900/55 text-neutral-100 ring-1 ring-amber-500/35 hover:-translate-y-px hover:ring-2 hover:ring-amber-500/45 hover:shadow-[0_0_16px_rgba(245,158,11,0.1)]";
  }
  return OBS.engineIdle;
}

export default function EngineCardGrid({
  engines,
  selectedId,
  onSelect,
  registryTabs = false,
  motionOnlyTabs = false,
}: Props) {
  const { isDe } = useLanguage();
  const [filter, setFilter] = useState<FilterTab | KreaPickerCategoryTab>(
    registryTabs ? "recommended" : motionOnlyTabs ? "not_connected" : "all"
  );
  const [search, setSearch] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(motionOnlyTabs);

  const items = useMemo(
    () =>
      engines
        .map((engine) => normalizeEngine(engine, isDe))
        .filter((engine) => !modelAvailabilityState(engine.availability).isHidden),
    [engines, isDe]
  );

  const tabs: { id: FilterTab; labelDe: string; labelEn: string }[] = motionOnlyTabs
    ? [
        { id: "all", labelDe: "Alle", labelEn: "All" },
        { id: "recommended", labelDe: "Empfohlen", labelEn: "Recommended" },
        { id: "experimental", labelDe: "Experimental", labelEn: "Experimental" },
        { id: "not_connected", labelDe: "Nicht angebunden", labelEn: "Not connected" },
      ]
    : [
        { id: "all", labelDe: "Alle", labelEn: "All" },
        { id: "recommended", labelDe: "Empfohlen", labelEn: "Recommended" },
        { id: "image", labelDe: "Bild", labelEn: "Image" },
        { id: "experimental", labelDe: "Experimental", labelEn: "Experimental" },
        { id: "not_connected", labelDe: "Nicht angebunden", labelEn: "Not connected" },
      ];

  const filtered = useMemo(() => {
    if (registryTabs) {
      return filterPickerCatalog(items, filter as KreaPickerCategoryTab, search, showUnavailable);
    }
    const q = search.trim().toLowerCase();
    return items.filter((engine) => {
      const { isUnavailable, isExperimental } = modelAvailabilityState(
        engine.availability
      );

      if (filter === "recommended" && !engine.isRecommended) return false;
      if (filter === "experimental" && !isExperimental) return false;
      if (filter === "not_connected" && !isUnavailable) return false;
      if (filter === "image" && isUnavailable) return false;
      if (filter === "all" && isUnavailable && !showUnavailable) return false;

      if (q) {
        const hay = `${engine.label} ${engine.note ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [items, filter, search, showUnavailable, registryTabs]);

  const tabButtons = registryTabs
    ? PICKER_CATEGORY_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setFilter(tab.id)}
          className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
            filter === tab.id ? OBS.pillActive : OBS.pillIdle
          }`}
        >
          {isDe ? tab.labelDe : tab.labelEn}
        </button>
      ))
    : tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setFilter(tab.id)}
          className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
            filter === tab.id ? OBS.pillActive : OBS.pillIdle
          }`}
        >
          {isDe ? tab.labelDe : tab.labelEn}
        </button>
      ));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-2 sm:px-4">
      <div className="flex flex-wrap gap-2">{tabButtons}</div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isDe ? "Qualitätsmodus suchen…" : "Search quality modes…"}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-amber-500/40"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-500">
          <input
            type="checkbox"
            checked={showUnavailable}
            onChange={(e) => setShowUnavailable(e.target.checked)}
            className="rounded border-neutral-600 bg-neutral-900 text-amber-500 focus:ring-amber-500/30"
          />
          {isDe ? "Demnächst anzeigen" : "Show coming soon"}
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-neutral-500">
            {isDe ? "Keine Modi für diesen Filter." : "No modes match this filter."}
          </p>
          {motionOnlyTabs && !showUnavailable ? (
            <p className="mt-2 text-xs text-neutral-600">
              {isDe
                ? "Aktiviere „Demnächst anzeigen“, um geplante Motion-Modi zu sehen."
                : "Enable “Show coming soon” to see planned motion modes."}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((engine, index) => {
            const selected = engine.value === selectedId;
            const { isUnavailable, isExperimental, isSelectable } =
              modelAvailabilityState(engine.availability);
            const disabled = motionOnlyTabs
              ? false
              : !isSelectable || engine.disabled === true;

            return (
              <motion.button
                key={engine.value}
                type="button"
                disabled={disabled}
                initial={{ opacity: 0 }}
                animate={{ opacity: isUnavailable && !selected ? 0.45 : 1 }}
                transition={{ ...OBS_SPRING, delay: index * 0.02 }}
                whileTap={disabled ? undefined : { scale: 0.97 }}
                onClick={() => {
                  if (!disabled) onSelect(engine.value);
                }}
                className={`relative rounded-2xl p-3 text-left backdrop-blur-2xl transition-[box-shadow,transform,opacity] ${cardClassName(
                  engine.availability,
                  selected,
                  isUnavailable
                )}`}
              >
                {engine.isRecommended ? (
                  <span className="absolute right-2 top-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                    {isDe ? "Empfohlen" : "Recommended"}
                  </span>
                ) : null}
                {isExperimental ? (
                  <span
                    className={`absolute rounded-full border border-amber-500/50 bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-300 ${
                      engine.isRecommended ? "right-2 top-7" : "right-2 top-2"
                    }`}
                  >
                    {isDe ? "Experimental" : "Experimental"}
                  </span>
                ) : null}
                <p
                  className={`pr-4 text-xs font-bold sm:text-sm ${
                    isUnavailable ? "text-neutral-500" : "text-neutral-100"
                  }`}
                >
                  {engine.label}
                </p>
                <p
                  className={`mt-1 line-clamp-2 text-[10px] leading-relaxed sm:text-[11px] ${
                    isUnavailable ? "text-neutral-600" : "text-neutral-400"
                  }`}
                >
                  {engine.note}
                </p>
                {engine.credits != null ? (
                  <p
                    className={`mt-2 text-[10px] font-semibold ${
                      isUnavailable ? "text-neutral-700" : "text-amber-500/70"
                    }`}
                  >
                    {engine.credits} Credits
                  </p>
                ) : null}
            {isUnavailable ? (
              <p className="mt-1 text-[9px] font-medium leading-snug text-neutral-600">
                {unavailableEngineMessage(engine, isDe)}
              </p>
            ) : null}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
