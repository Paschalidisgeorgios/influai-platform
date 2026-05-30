"use client";

import Link from "next/link";
import type { LandingLanguage } from "../magnificContent";

export default function ObsidianNavbar({
  currentLanguage,
  setCurrentLanguage,
  studioHref,
  copy,
}: {
  currentLanguage: LandingLanguage;
  setCurrentLanguage: (lang: LandingLanguage) => void;
  studioHref: string;
  copy: {
    product: string;
    pricing: string;
    faq: string;
    signIn: string;
    openStudio: string;
  };
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-[#050505]/90 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-black leading-none tracking-tight">
            <span className="text-white">Influ</span>
            <span className="text-amber-400">Ex</span>
            <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center justify-center gap-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 sm:order-none sm:w-auto">
          <a href="#product" className="transition hover:text-amber-400">
            {copy.product}
          </a>
          <a href="#pricing" className="transition hover:text-amber-400">
            {copy.pricing}
          </a>
          <a href="#faq" className="transition hover:text-amber-400">
            {copy.faq}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-0.5">
            {(["en", "de"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setCurrentLanguage(lang)}
                className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                  currentLanguage === lang ? "bg-amber-500 text-black" : "text-neutral-500 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <Link
            href="/auth"
            className="hidden text-[10px] font-semibold uppercase tracking-wider text-neutral-500 transition hover:text-amber-400 sm:inline"
          >
            {copy.signIn}
          </Link>
          <Link
            href={studioHref}
            className="rounded-xl bg-amber-500 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-amber-600"
          >
            {copy.openStudio}
          </Link>
        </div>
      </div>
    </header>
  );
}
