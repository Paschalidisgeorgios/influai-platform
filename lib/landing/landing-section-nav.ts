/**
 * Landing page section anchors — Workflow, Models, Credits, Trust, FAQ.
 */

export const LANDING_SECTION_IDS = [
  "workflow",
  "models",
  "credits",
  "trust",
  "faq",
] as const;

export type LandingSectionId = (typeof LANDING_SECTION_IDS)[number];

/** Offset for sticky header when scrolling to anchors (no layout shift). */
export const LANDING_SECTION_SCROLL_MT = "scroll-mt-[5.75rem] md:scroll-mt-20";

type SectionNavItem = {
  id: LandingSectionId;
  labelEn: string;
  labelDe: string;
};

export const LANDING_SECTION_NAV_ITEMS: readonly SectionNavItem[] = [
  { id: "workflow", labelEn: "Workflow", labelDe: "Workflow" },
  { id: "models", labelEn: "Models", labelDe: "Modelle" },
  { id: "credits", labelEn: "Credits", labelDe: "Credits" },
  { id: "trust", labelEn: "Trust", labelDe: "Trust" },
  { id: "faq", labelEn: "FAQ", labelDe: "FAQ" },
] as const;

export function getLandingSectionNavItems(
  language: "en" | "de"
): { id: LandingSectionId; label: string; href: string }[] {
  const isDe = language === "de";
  return LANDING_SECTION_NAV_ITEMS.map((item) => ({
    id: item.id,
    label: isDe ? item.labelDe : item.labelEn,
    href: `#${item.id}`,
  }));
}

export const LANDING_PACK_PREVIEW_CTA = {
  en: "Preview your first pack",
  de: "Erstes Paket previewen",
} as const;

export function getLandingPackPreviewCta(language: "en" | "de"): string {
  return language === "de"
    ? LANDING_PACK_PREVIEW_CTA.de
    : LANDING_PACK_PREVIEW_CTA.en;
}

export function isLandingSectionId(value: string): value is LandingSectionId {
  return (LANDING_SECTION_IDS as readonly string[]).includes(value);
}

export function scrollToLandingSection(
  id: LandingSectionId,
  behavior: ScrollBehavior = "smooth"
): void {
  const target = document.getElementById(id);
  if (!target) return;

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  target.scrollIntoView({
    behavior: prefersReduced ? "auto" : behavior,
    block: "start",
  });

  if (typeof history !== "undefined" && history.replaceState) {
    history.replaceState(null, "", `#${id}`);
  }
}
