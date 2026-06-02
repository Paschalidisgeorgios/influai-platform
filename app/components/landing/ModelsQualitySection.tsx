"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

type DrawerItem = {
  label: string;
  status: "active" | "coming_soon";
};

export default function ModelsQualitySection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].modelsQuality;
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const activeGroup = t.groups[activeGroupIndex] ?? t.groups[0];

  return (
    <section
      id="models"
      className={`border-t border-white/[0.06] bg-[#070A12] ${LANDING_LAYOUT.section}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={`grid lg:grid-cols-2 lg:items-start ${LANDING_LAYOUT.gridWide}`}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={OBS_SPRING}
          >
            <p className={PREMIUM_CLASSES.mono}>{t.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
              {t.headline}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/65 sm:text-lg">{t.body}</p>
            <p className="mt-6 rounded-xl border border-white/[0.08] bg-[#111827]/40 px-4 py-3 text-sm text-white/55">
              {t.footnote}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...OBS_SPRING, delay: 0.08 }}
            className={`${PREMIUM_CLASSES.glass} ${PREMIUM_CLASSES.glowPurple} overflow-hidden`}
            aria-hidden
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] px-4 py-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#8B5CF6]" aria-hidden />
                <span className="text-xs font-semibold text-white">{t.drawerTitle}</span>
              </div>
              <span className="text-[10px] text-[#9CA3AF]">{t.previewBadge}</span>
            </div>

            <div className="flex max-h-[min(420px,60vh)] flex-col sm:max-h-[480px] sm:flex-row">
              <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.06] p-2 sm:w-[38%] sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r">
                {t.groups.map((group, index) => (
                  <button
                    key={group.id}
                    type="button"
                    tabIndex={-1}
                    className={`shrink-0 rounded-lg px-2.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide transition sm:w-full ${
                      index === activeGroupIndex
                        ? "bg-[#8B5CF6]/15 text-[#C4B5FD]"
                        : "text-[#9CA3AF] hover:bg-white/[0.04]"
                    }`}
                    onMouseEnter={() => setActiveGroupIndex(index)}
                  >
                    {group.label}
                  </button>
                ))}
              </nav>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  {activeGroup.label}
                </p>
                <ul className="space-y-1.5">
                  {activeGroup.items.map((item: DrawerItem) => (
                    <DrawerModeRow
                      key={item.label}
                      item={item}
                      activeLabel={t.activeLabel}
                      comingSoonLabel={t.comingSoonLabel}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 lg:hidden">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            {t.drawerTitle}
          </p>
          <div className="space-y-4">
            {t.groups.map((group) => (
              <div
                key={group.id}
                className="rounded-xl border border-white/[0.08] bg-[#111827]/40 p-3"
              >
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  {group.label}
                </p>
                <ul className="space-y-1.5">
                  {group.items.map((item: DrawerItem) => (
                    <DrawerModeRow
                      key={item.label}
                      item={item}
                      activeLabel={t.activeLabel}
                      comingSoonLabel={t.comingSoonLabel}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DrawerModeRow({
  item,
  activeLabel,
  comingSoonLabel,
}: {
  item: DrawerItem;
  activeLabel: string;
  comingSoonLabel: string;
}) {
  const isActive = item.status === "active";

  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 ${
        isActive
          ? "border-[#8B5CF6]/25 bg-[#8B5CF6]/8"
          : "border-white/[0.06] bg-[#070A12]/60 opacity-70"
      }`}
    >
      <span
        className={`text-xs font-medium ${isActive ? "text-white" : "text-white/60"}`}
      >
        {item.label}
      </span>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
          isActive
            ? "bg-[#22C55E]/10 text-[#86EFAC]"
            : "border border-white/[0.08] bg-[#0E1220] text-[#9CA3AF]"
        }`}
      >
        {isActive ? activeLabel : comingSoonLabel}
      </span>
    </li>
  );
}
