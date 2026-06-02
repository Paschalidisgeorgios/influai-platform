"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ObsidianButton from "@/app/components/shared/ObsidianButton";
import LandingSectionNav from "../LandingSectionNav";
import { useLandingSectionSpy } from "../use-landing-section-spy";
import {
  getLandingPackPreviewCta,
  getLandingSectionNavItems,
  scrollToLandingSection,
  type LandingSectionId,
} from "@/lib/landing/landing-section-nav";
import type { LandingLanguage } from "../magnificContent";

export type ObsidianNavCopy = {
  features: string;
  models: string;
  pricing: string;
  signIn: string;
  openStudio: string;
};

function LogoMark() {
  return (
    <span className="text-lg font-black leading-none tracking-tight">
      <span className="text-white">Influ</span>
      <span className="text-[#d8ad5f]">Ex</span>
      <span className="bg-gradient-to-r from-[#efc777] via-[#d8ad5f] to-[#a8843f] bg-clip-text text-transparent">
        AI
      </span>
    </span>
  );
}

export default function ObsidianNavbar({
  currentLanguage,
  setCurrentLanguage,
  studioHref,
  copy,
}: {
  currentLanguage: LandingLanguage;
  setCurrentLanguage: (lang: LandingLanguage) => void;
  studioHref: string;
  copy: ObsidianNavCopy;
}) {
  const lang = currentLanguage === "de" ? "de" : "en";
  const activeSection = useLandingSectionSpy("workflow");
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionItems = getLandingSectionNavItems(lang);
  const packCta = getLandingPackPreviewCta(lang);

  function closeMobile() {
    setMobileOpen(false);
  }

  function navigateToSection(id: LandingSectionId) {
    scrollToLandingSection(id);
    closeMobile();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-[#050505]/90 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-2 py-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            onClick={closeMobile}
          >
            <LogoMark />
          </Link>

          <LandingSectionNav
            language={lang}
            variant="desktop"
            activeSection={activeSection}
          />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-0.5 sm:flex">
              {(["en", "de"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setCurrentLanguage(l)}
                  className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition sm:px-3 ${
                    currentLanguage === l
                      ? "bg-[#d8ad5f] text-black"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <ObsidianButton
              href="/auth?mode=login"
              variant="ghost"
              size="sm"
              surface="landing"
              className="hidden uppercase tracking-wider lg:inline-flex"
            >
              {copy.signIn}
            </ObsidianButton>

            <ObsidianButton
              href={studioHref}
              variant="primary"
              size="sm"
              surface="landing"
              className="max-w-[11rem] truncate text-[9px] font-black uppercase tracking-wide sm:max-w-none sm:text-[10px]"
            >
              {packCta}
            </ObsidianButton>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800/80 bg-neutral-900/40 text-neutral-300 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-nav"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <X className="h-4 w-4" aria-hidden />
              ) : (
                <Menu className="h-4 w-4" aria-hidden />
              )}
              <span className="sr-only">Menu</span>
            </button>
          </div>
        </div>

        <div className="border-t border-white/[0.06] lg:hidden">
          <LandingSectionNav
            language={lang}
            variant="mobile-pills"
            activeSection={activeSection}
            onNavigate={closeMobile}
          />
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="landing-mobile-nav"
          className="border-t border-neutral-800/80 bg-[#050505]/95 px-4 py-4 backdrop-blur-2xl lg:hidden"
        >
          <nav className="flex flex-col gap-1 text-sm font-semibold text-neutral-300">
            {sectionItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="rounded-lg px-2 py-2.5 hover:bg-neutral-900/60 hover:text-[#d8ad5f]"
                onClick={(event) => {
                  event.preventDefault();
                  navigateToSection(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
            <ObsidianButton
              href="/auth?mode=login"
              variant="ghost"
              size="sm"
              surface="landing"
              className="mt-2 justify-start"
              onClick={closeMobile}
            >
              {copy.signIn}
            </ObsidianButton>
          </nav>
          <div className="mt-4 flex gap-1 border-t border-neutral-800/80 pt-4">
            {(["en", "de"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setCurrentLanguage(l)}
                className={`flex-1 rounded-lg py-2 text-[10px] font-bold uppercase tracking-wider ${
                  currentLanguage === l
                    ? "bg-[#d8ad5f] text-black"
                    : "text-neutral-600"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
