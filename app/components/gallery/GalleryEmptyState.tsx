"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

type Props = {
  language?: "en" | "de";
};

const COPY = {
  en: {
    title: "Your first Pack is waiting",
    subtitle: "You have free credits. Create your first Social Asset Pack now.",
    cta: "Create Social Asset Pack →",
    secondary: "Browse example outputs",
  },
  de: {
    title: "Dein erstes Pack wartet",
    subtitle: "Du hast kostenlose Credits. Erstelle jetzt dein erstes Social Asset Pack.",
    cta: "Social Asset Pack erstellen →",
    secondary: "Beispiel-Outputs ansehen",
  },
};

export default function GalleryEmptyState({ language = "en" }: Props) {
  const t = COPY[language];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d8ad5f]/20 bg-[#d8ad5f]/10">
        <Sparkles className="h-8 w-8 text-[#d8ad5f]" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-white">{t.title}</h3>
      <p className="mb-8 max-w-sm text-sm text-white/50">{t.subtitle}</p>
      <Link
        href="/dashboard"
        className="rounded-2xl bg-[#d8ad5f] px-8 py-3.5 text-sm font-bold text-black transition hover:bg-[#efc777]"
      >
        {t.cta}
      </Link>
      <button
        type="button"
        className="mt-4 text-xs text-white/25 transition hover:text-white/50"
      >
        {t.secondary}
      </button>
    </div>
  );
}
