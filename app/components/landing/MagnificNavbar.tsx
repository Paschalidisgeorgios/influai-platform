"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";

export default function MagnificNavbar({
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
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-extrabold tracking-tight text-white">
            InfluExAi
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center justify-center gap-8 text-xs font-medium uppercase tracking-widest text-neutral-400 sm:order-none sm:w-auto">
          <a href="#product" className="transition hover:text-white">
            {copy.product}
          </a>
          <a href="#pricing" className="transition hover:text-white">
            {copy.pricing}
          </a>
          <a href="#faq" className="transition hover:text-white">
            {copy.faq}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-neutral-700 bg-neutral-900/80 p-0.5">
            {(["en", "de"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setCurrentLanguage(lang)}
                className={`rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                  currentLanguage === lang
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <Link
            href="/login"
            className="hidden text-xs font-medium text-neutral-400 transition hover:text-white sm:inline"
          >
            {copy.signIn}
          </Link>
          <Link
            href={studioHref}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-neutral-200"
          >
            {copy.openStudio}
          </Link>
        </div>
      </div>
    </header>
  );
}
