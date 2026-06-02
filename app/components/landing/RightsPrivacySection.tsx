"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import TrustCommercialFaqList from "@/app/components/shared/TrustCommercialFaqList";
import { LANDING_LAYOUT } from "@/lib/obsidian/premium-tokens";
import { getTrustCommercialFaq } from "@/lib/copy/trust-commercial-faq";
import type { LandingLanguage } from "./magnificContent";

export default function RightsPrivacySection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const lang = currentLanguage === "de" ? "de" : "en";
  const panel = getTrustCommercialFaq(lang);

  return (
    <section
      id="rights"
      className={`border-t border-neutral-800 bg-[#050505] ${LANDING_LAYOUT.section}`}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="mb-8 flex flex-col items-center text-center sm:mb-10"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10">
            <ShieldCheck className="h-6 w-6 text-amber-400" aria-hidden />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 md:text-4xl">
            {panel.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
            {panel.intro}
          </p>
        </motion.div>

        <TrustCommercialFaqList
          language={lang}
          variant="landing"
          className={LANDING_LAYOUT.afterHeader}
        />
      </div>
    </section>
  );
}
