"use client";

import Link from "next/link";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useLanguage } from "@/hooks/useLanguage";

export default function ObsidianCreditBadge() {
  const { credits, creditsLoading } = useCreativeSuite();
  const { isDe } = useLanguage();

  const label = creditsLoading
    ? "…"
    : `${credits.toLocaleString(isDe ? "de-DE" : "en-US")} ${isDe ? "Credits" : "Credits"}`;

  return (
    <Link
      href="/dashboard/credits"
      className="flex w-full items-center justify-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-300 transition hover:border-amber-500/40 hover:bg-amber-500/15"
      title={isDe ? "Credits verwalten" : "Manage credits"}
    >
      <span aria-hidden>⚡</span>
      <span>{label}</span>
    </Link>
  );
}
