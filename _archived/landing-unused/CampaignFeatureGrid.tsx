"use client";

import { motion } from "framer-motion";
import type {
  LandingCreatorToolStatus,
  LandingLanguage,
} from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { A11Y } from "@/lib/obsidian/a11y-tokens";
import { LANDING_LAYOUT } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

function statusBadgeClass(status: LandingCreatorToolStatus): string {
  switch (status) {
    case "available":
      return A11Y.badgeAvailable;
    case "credit_gated":
      return A11Y.badgeCreditGated;
    case "preview":
      return A11Y.badgePreview;
    case "request_access":
      return A11Y.badgeRequestAccess;
    case "pro":
      return A11Y.badgePro;
    case "coming_soon":
    default:
      return A11Y.badgeMuted;
  }
}

export default function CampaignFeatureGrid({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].campaignFeatures;

  return (
    <section id="studio-features" className={`bg-[#050505] ${LANDING_LAYOUT.section}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={OBS_SPRING}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
            {t.headline}
          </h2>
          {t.subheadline ? (
            <p className="mt-4 text-base leading-7 text-neutral-400">{t.subheadline}</p>
          ) : null}
        </motion.div>

        <div
          className={`${LANDING_LAYOUT.afterHeader} grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
        >
          {t.cards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...OBS_SPRING, delay: index * 0.03 }}
              className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-white">{card.title}</h3>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusBadgeClass(card.status)}`}
                >
                  {t.statusLabels[card.status]}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-400">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
