"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import type { LandingLanguage as PageLanguage } from "./magnificContent";
import { MODEL_EXPLORER_COPY } from "@/lib/landing/product-theatre-content";
import { resolveModelExplorerCategories } from "@/lib/landing/model-explorer";
import type { StudioCategoryId } from "@/app/lib/studio/studio-categories";
import { LANDING_SECTION_SCROLL_MT } from "@/lib/landing/landing-section-nav";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import ModelCategoryTabs from "./ModelCategoryTabs";
import ModelCapabilityCard from "./ModelCapabilityCard";

type Props = {
  currentLanguage: PageLanguage;
};

export default function ModelExplorerSection({ currentLanguage }: Props) {
  const language = currentLanguage === "de" ? "de" : "en";
  const copy = MODEL_EXPLORER_COPY[language];

  const categories = useMemo(
    () => resolveModelExplorerCategories(language),
    [language]
  );

  const [activeCategoryId, setActiveCategoryId] = useState<StudioCategoryId>(
    () => categories[0]?.id ?? "create"
  );

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0];

  const tabs = useMemo(
    () => categories.map((c) => ({ id: c.id, label: c.label })),
    [categories]
  );

  const footnote =
    language === "de"
      ? "Nur nutzerfreundliche Workflow-Namen — keine Provider- oder Modell-IDs auf der Landing Page."
      : "User-facing workflow names only — no provider or model IDs on the landing page.";

  return (
    <section
      id="models"
      className={`border-t border-white/[0.06] bg-transparent ${LANDING_SECTION_SCROLL_MT} ${LANDING_LAYOUT.sectionCompact}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={OBS_SPRING}
          className="mb-5 max-w-2xl"
        >
          <p className={PREMIUM_CLASSES.mono}>{copy.eyebrow}</p>
          <h2 className="mt-2 text-xl font-black uppercase italic tracking-tight text-white sm:text-2xl md:text-3xl">
            {copy.headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60 sm:text-base">
            {copy.body}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...OBS_SPRING, delay: 0.05 }}
          className={`${PREMIUM_CLASSES.glass} overflow-hidden`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-amber-400" aria-hidden />
              <span className="text-xs font-semibold text-white">
                {language === "de" ? "Workflow-Kategorien" : "Workflow categories"}
              </span>
            </div>
            <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
              {language === "de" ? "Studio-Übersicht" : "Studio overview"}
            </span>
          </div>

          <div className="border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
            <ModelCategoryTabs
              tabs={tabs}
              activeId={activeCategory?.id ?? "create"}
              onSelect={setActiveCategoryId}
              ariaLabel={copy.eyebrow}
            />
          </div>

          {activeCategory ? (
            <div
              role="tabpanel"
              id={`model-explorer-panel-${activeCategory.id}`}
              aria-labelledby={`model-explorer-tab-${activeCategory.id}`}
              className="max-h-[min(340px,58vh)] overflow-y-auto p-3 sm:p-4"
            >
              <p className="mb-3 text-[11px] leading-relaxed text-neutral-500 sm:text-xs">
                {activeCategory.description}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {activeCategory.tools.map((tool, index) => (
                  <li key={tool.id}>
                    <ModelCapabilityCard
                      view={tool}
                      language={language}
                      index={index}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="border-t border-white/[0.06] px-4 py-2 text-[11px] leading-relaxed text-neutral-500">
            {footnote}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
