"use client";

import Link from "next/link";
import { Language, landingText } from "./landingText";

export default function Navbar({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  const t = landingText[language];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-5">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between rounded-full border border-white/15 bg-black/35 px-5 py-3 shadow-2xl backdrop-blur-2xl sm:px-7">
        <Link
          href="/"
          className="text-xs font-black uppercase tracking-[0.55em] text-white sm:text-sm"
        >
          Influ<span className="text-[#d8ad5f]">ExAi</span>
        </Link>

        <nav className="hidden items-center gap-10 text-sm font-semibold text-white/65 lg:flex">
          <a href="#studio" className="transition hover:text-[#d8ad5f]">
            {t.product}
          </a>
          <a href="#tools" className="transition hover:text-[#d8ad5f]">
            {t.tools}
          </a>
          <a href="#pricing" className="transition hover:text-[#d8ad5f]">
            {t.pricing}
          </a>
          <a href="#examples" className="transition hover:text-[#d8ad5f]">
            {t.creators}
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                language === "en"
                  ? "bg-[#d8ad5f] text-black"
                  : "text-white/60 hover:text-[#d8ad5f]"
              }`}
            >
              EN
            </button>

            <button
              type="button"
              onClick={() => setLanguage("de")}
              className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                language === "de"
                  ? "bg-[#d8ad5f] text-black"
                  : "text-white/60 hover:text-[#d8ad5f]"
              }`}
            >
              DE
            </button>
          </div>

          <Link
            href="/login"
            className="hidden text-sm font-semibold text-white/65 transition hover:text-[#d8ad5f] sm:block"
          >
            {t.signIn}
          </Link>

          <Link
            href="/dashboard"
            className="hidden rounded-full bg-[#d8ad5f] px-5 py-3 text-xs font-extrabold text-black transition hover:bg-[#efc777] sm:inline-flex sm:px-7 sm:text-sm"
          >
            {t.openApp}
          </Link>
        </div>
      </div>
    </header>
  );
}