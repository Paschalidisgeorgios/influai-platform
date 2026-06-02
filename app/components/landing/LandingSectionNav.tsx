"use client";

import type { MouseEvent } from "react";
import {
  getLandingSectionNavItems,
  scrollToLandingSection,
  type LandingSectionId,
} from "@/lib/landing/landing-section-nav";

type Props = {
  language: "en" | "de";
  variant: "desktop" | "mobile-pills";
  activeSection: LandingSectionId;
  onNavigate?: () => void;
  className?: string;
};

function handleSectionClick(
  id: LandingSectionId,
  onNavigate?: () => void
) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToLandingSection(id);
    onNavigate?.();
  };
}

export default function LandingSectionNav({
  language,
  variant,
  activeSection,
  onNavigate,
  className = "",
}: Props) {
  const items = getLandingSectionNavItems(language);
  const activeId = activeSection;

  if (variant === "desktop") {
    return (
      <nav
        className={`hidden items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 lg:flex ${className}`}
        aria-label={language === "de" ? "Landing-Abschnitte" : "Landing sections"}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={handleSectionClick(item.id, onNavigate)}
              className={`relative transition hover:text-amber-400 ${
                active ? "text-amber-300" : ""
              }`}
              aria-current={active ? "location" : undefined}
            >
              {item.label}
              {active ? (
                <span
                  className="absolute -bottom-1 left-0 right-0 h-px bg-amber-500/70"
                  aria-hidden
                />
              ) : null}
            </a>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className={`flex gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden ${className}`}
      aria-label={language === "de" ? "Landing-Abschnitte" : "Landing sections"}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <a
            key={item.id}
            href={item.href}
            onClick={handleSectionClick(item.id, onNavigate)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
              active
                ? "bg-amber-500/15 text-amber-100 ring-1 ring-amber-500/35"
                : "border border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white"
            }`}
            aria-current={active ? "location" : undefined}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
