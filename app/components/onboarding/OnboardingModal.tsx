"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useEscapeKey } from "@/lib/hooks/use-escape-key";

type Goal = "creator" | "brand" | "agency" | "personal";

type Props = {
  onComplete: (goal: Goal) => void;
  language: "en" | "de";
};

const COPY = {
  en: {
    title: "Welcome. Let's set up your studio.",
    subtitle: "What will you create? Takes 10 seconds.",
    goals: [
      { id: "creator" as Goal, label: "Content Creator", sub: "TikTok, Instagram, YouTube" },
      { id: "brand" as Goal, label: "Brand / E-Commerce", sub: "Product campaigns & ads" },
      { id: "agency" as Goal, label: "Agency", sub: "Client content production" },
      { id: "personal" as Goal, label: "Personal / Freelance", sub: "My own projects" },
    ],
    cta: "Start with 50 free credits →",
    skip: "Skip for now",
    freeNote: "No credit card required",
  },
  de: {
    title: "Willkommen. Wir richten dein Studio ein.",
    subtitle: "Was wirst du erstellen? Dauert 10 Sekunden.",
    goals: [
      { id: "creator" as Goal, label: "Content Creator", sub: "TikTok, Instagram, YouTube" },
      { id: "brand" as Goal, label: "Brand / E-Commerce", sub: "Produkt-Kampagnen & Ads" },
      { id: "agency" as Goal, label: "Agentur", sub: "Kunden-Content-Produktion" },
      { id: "personal" as Goal, label: "Persönlich / Freelance", sub: "Eigene Projekte" },
    ],
    cta: "Mit 50 kostenlosen Credits starten →",
    skip: "Überspringen",
    freeNote: "Keine Kreditkarte erforderlich",
  },
};

export default function OnboardingModal({ onComplete, language }: Props) {
  const [selected, setSelected] = useState<Goal | null>(null);
  const t = COPY[language];

  const handleSkip = useCallback(() => {
    onComplete("personal");
  }, [onComplete]);

  useEscapeKey(handleSkip);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0D0D0F] p-8 shadow-2xl"
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d8ad5f]/20 bg-[#d8ad5f]/10">
            <Sparkles className="h-7 w-7 text-[#d8ad5f]" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-2xl font-bold text-white">{t.title}</h2>
        <p className="mb-6 text-center text-sm text-white/50">{t.subtitle}</p>

        <div className="mb-6 grid grid-cols-2 gap-3">
          {t.goals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => setSelected(goal.id)}
              className={`min-h-11 rounded-2xl border p-4 text-left transition-all ${
                selected === goal.id
                  ? "border-[#d8ad5f]/60 bg-[#d8ad5f]/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <p className="text-sm font-semibold text-white">{goal.label}</p>
              <p className="mt-0.5 text-xs text-white/40">{goal.sub}</p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => selected && onComplete(selected)}
          disabled={!selected}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#d8ad5f] py-3.5 text-sm font-bold text-black transition hover:bg-[#efc777] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.cta} <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-3 text-center text-xs text-white/20">{t.freeNote}</p>

        <button
          type="button"
          onClick={handleSkip}
          className="mt-2 min-h-11 w-full text-center text-xs text-white/25 transition hover:text-white/50"
        >
          {t.skip}
        </button>
      </motion.div>
    </div>
  );
}
