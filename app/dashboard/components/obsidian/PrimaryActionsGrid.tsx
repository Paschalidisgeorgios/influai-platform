"use client";

import { motion } from "framer-motion";
import { Image, Package, Video } from "lucide-react";
import DashboardZoneLabel from "@/app/components/studio/DashboardZoneLabel";
import {
  formatPackRenderCta,
  getSocialAssetPackCopy,
  getSocialAssetPackTotalCredits,
} from "@/app/lib/packs/social-asset-pack";
import { DASHBOARD_ZONES } from "@/lib/copy/launch-user-copy";
import {
  getObsidianEngineLabel,
  type ObsidianEngineCard,
  type ObsidianEngineId,
} from "@/lib/obsidian/dashboard-tokens";
import { A11Y } from "@/lib/obsidian/a11y-tokens";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";
import { PREMIUM_CLASSES, PREMIUM_SPRING } from "@/lib/obsidian/premium-tokens";
import { useLanguage } from "@/hooks/useLanguage";

type Props = {
  packEngine: ObsidianEngineCard;
  imageEngine: ObsidianEngineCard;
  videoEngine: ObsidianEngineCard;
  selectedId: ObsidianEngineId;
  onSelect: (id: ObsidianEngineId) => void;
  onPreviewPack: () => void;
  onRenderPack: () => void;
  previewDisabled?: boolean;
  packRecommended?: boolean;
};

export default function PrimaryActionsGrid({
  packEngine,
  imageEngine,
  videoEngine,
  selectedId,
  onSelect,
  onPreviewPack,
  onRenderPack,
  previewDisabled = true,
  packRecommended = false,
}: Props) {
  const { isDe } = useLanguage();
  const lang = isDe ? "de" : "en";
  const packCopy = getSocialAssetPackCopy(lang);
  const packCredits = getSocialAssetPackTotalCredits();
  const renderCta = formatPackRenderCta(packCredits, lang);
  const packSelected = selectedId === packEngine.id;

  return (
    <div className="space-y-3">
      <DashboardZoneLabel
        label={isDe ? DASHBOARD_ZONES.primaryActions.de : DASHBOARD_ZONES.primaryActions.en}
      />

      <motion.div
        role="group"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={PREMIUM_SPRING}
        onClick={() => onSelect(packEngine.id)}
        className={`relative w-full cursor-pointer overflow-hidden rounded-2xl p-5 text-left sm:p-6 ${PREMIUM_CLASSES.cardBase} ${PREMIUM_CLASSES.primaryHeroCard} ${
          packSelected
            ? PREMIUM_CLASSES.primaryHeroSelected
            : PREMIUM_CLASSES.cardHoverLift
        } ${A11Y.focusRing}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl"
        />
        {packRecommended ? (
          <span className="absolute right-4 top-4 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            {isDe ? "Empfohlen" : "Recommended"}
          </span>
        ) : null}
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Package className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold tracking-tight text-[#F9FAFB] sm:text-xl">
              {getObsidianEngineLabel(packEngine, lang)}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#9CA3AF]">
              {isDe ? packEngine.descriptionDe : packEngine.descriptionEn}
            </p>
          </div>
          {packSelected ? (
            <span className="shrink-0 rounded-full border border-amber-500/45 bg-amber-500/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200">
              {isDe ? "Aktiv" : "Active"}
            </span>
          ) : null}
        </div>
        <div
          className="relative mt-5 flex flex-wrap gap-2"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            disabled={previewDisabled}
            onClick={() => {
              onSelect(packEngine.id);
              onPreviewPack();
            }}
            className={obsidianButtonClass("primary", {
              size: "sm",
              className: "disabled:opacity-45",
            })}
          >
            {packCopy.previewCta}
          </button>
          <button
            type="button"
            onClick={() => {
              onSelect(packEngine.id);
              onRenderPack();
            }}
            className={obsidianButtonClass("secondary", { size: "sm" })}
          >
            {renderCta}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[imageEngine, videoEngine].map((engine, index) => {
          const selected = engine.id === selectedId;
          const Icon = engine.id === "create-image" ? Image : Video;
          return (
            <motion.button
              key={engine.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...PREMIUM_SPRING, delay: 0.05 + index * 0.04 }}
              onClick={() => onSelect(engine.id)}
              className={`rounded-2xl p-3.5 text-left sm:p-4 ${PREMIUM_CLASSES.glassCard} ${PREMIUM_CLASSES.cardBase} ${
                selected ? PREMIUM_CLASSES.cardSelected : PREMIUM_CLASSES.cardHoverLift
              } ${A11Y.focusRing}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border bg-[#0E1220]/80 transition-colors ${
                    selected
                      ? "border-amber-500/35 text-amber-300"
                      : "border-white/[0.08] text-[#9CA3AF] group-hover:text-amber-300"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                {selected ? (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                    {isDe ? "Aktiv" : "Active"}
                  </span>
                ) : null}
              </div>
              <p className="mt-2.5 text-sm font-semibold text-[#F9FAFB]">
                {getObsidianEngineLabel(engine, lang)}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#9CA3AF]">
                {isDe ? engine.descriptionDe : engine.descriptionEn}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
