/**
 * Controlled landing media proof — static illustrative assets only.
 * No provider or model IDs.
 */

import {
  SHOWCASE_VARIATION_IMAGE_FALLBACK,
  SHOWCASE_VARIATION_IMAGES,
} from "@/app/lib/showcase/social-asset-pack-showcase-demo";

export type LandingMediaProofLanguage = "en" | "de";

export type LandingMediaTileType =
  | "image_variant"
  | "motion_preview"
  | "gallery"
  | "before_after"
  | "pack_preview";

export type LandingMediaCategoryId =
  | "beauty"
  | "fitness"
  | "streetwear"
  | "food"
  | "ecommerce"
  | "agency";

export type LandingMediaImageVariantTile = {
  type: "image_variant";
  id: string;
  categoryId: LandingMediaCategoryId;
  src: string;
  labelEn: string;
  labelDe: string;
  aspectRatio?: string;
  gridClass?: string;
};

export type LandingMediaMotionTile = {
  type: "motion_preview";
  id: string;
  categoryId: LandingMediaCategoryId;
  posterSrc: string;
  videoSrc?: string;
  labelEn: string;
  labelDe: string;
  hintEn: string;
  hintDe: string;
  gridClass?: string;
};

export type LandingMediaGalleryTile = {
  type: "gallery";
  id: string;
  categoryId: LandingMediaCategoryId;
  images: readonly { src: string; altEn: string; altDe: string }[];
  labelEn: string;
  labelDe: string;
  gridClass?: string;
};

export type LandingMediaBeforeAfterTile = {
  type: "before_after";
  id: string;
  categoryId: LandingMediaCategoryId;
  beforeSrc: string;
  afterSrc: string;
  promptEn: string;
  promptDe: string;
  labelEn: string;
  labelDe: string;
  gridClass?: string;
};

export type LandingMediaPackPreviewTile = {
  type: "pack_preview";
  id: string;
  categoryId: LandingMediaCategoryId;
  ideaEn: string;
  ideaDe: string;
  variationSrcs: readonly string[];
  variationLabelsEn: readonly string[];
  variationLabelsDe: readonly string[];
  motionPosterSrc: string;
  labelEn: string;
  labelDe: string;
  gridClass?: string;
};

export type LandingMediaProofTile =
  | LandingMediaImageVariantTile
  | LandingMediaMotionTile
  | LandingMediaGalleryTile
  | LandingMediaBeforeAfterTile
  | LandingMediaPackPreviewTile;

const CATEGORY_LABELS: Record<
  LandingMediaCategoryId,
  { en: string; de: string }
> = {
  beauty: { en: "Beauty product", de: "Beauty-Produkt" },
  fitness: { en: "Fitness creator", de: "Fitness-Creator" },
  streetwear: { en: "Streetwear", de: "Streetwear" },
  food: { en: "Food & beverage", de: "Food & Beverage" },
  ecommerce: { en: "E-commerce product", de: "E-Commerce-Produkt" },
  agency: { en: "Agency client pack", de: "Agentur-Kundenpack" },
};

export function getLandingMediaCategoryLabel(
  id: LandingMediaCategoryId,
  language: LandingMediaProofLanguage
): string {
  const row = CATEGORY_LABELS[id];
  return language === "de" ? row.de : row.en;
}

export const LANDING_MEDIA_PROOF_SECTION_COPY = {
  en: {
    eyebrow: "Media proof",
    headline: "Real creator outputs — illustrative demos.",
    body: "Image variations, motion previews, and pack assembly examples. Static previews on the landing page; rendering starts in the studio after credit confirmation.",
    demoBadge: "Illustrative demo",
  },
  de: {
    eyebrow: "Media Proof",
    headline: "Echte Creator-Outputs — illustrative Demos.",
    body: "Bildvarianten, Motion-Previews und Pack-Beispiele. Statische Vorschau auf der Landing Page; Rendering startet im Studio nach Credit-Bestätigung.",
    demoBadge: "Illustrative Demo",
  },
} as const;

/** Bento grid tiles — diverse niches, stable local assets. */
export const LANDING_MEDIA_PROOF_TILES: readonly LandingMediaProofTile[] = [
  {
    type: "pack_preview",
    id: "pack-beauty",
    categoryId: "beauty",
    ideaEn: "Premium skincare on marble, soft studio light",
    ideaDe: "Premium-Skincare auf Marmor, weiches Studiolicht",
    variationSrcs: SHOWCASE_VARIATION_IMAGES,
    variationLabelsEn: ["Feed", "TikTok", "Story"],
    variationLabelsDe: ["Feed", "TikTok", "Story"],
    motionPosterSrc: "/images/hero (27).jpg",
    labelEn: "Social Asset Pack",
    labelDe: "Social Asset Pack",
    gridClass: "sm:col-span-2 sm:row-span-2",
  },
  {
    type: "motion_preview",
    id: "motion-fitness",
    categoryId: "fitness",
    posterSrc: "/images/hero (5).jpg",
    labelEn: "Motion clip",
    labelDe: "Motion-Clip",
    hintEn: "5s loop · muted preview",
    hintDe: "5s Loop · stumme Vorschau",
    gridClass: "sm:col-span-1",
  },
  {
    type: "image_variant",
    id: "variant-streetwear",
    categoryId: "streetwear",
    src: "/assets/hero-streetfoto.png.png",
    labelEn: "Look B · Story",
    labelDe: "Look B · Story",
    gridClass: "sm:col-span-1",
  },
  {
    type: "gallery",
    id: "gallery-agency",
    categoryId: "agency",
    images: [
      {
        src: "/images/hero (25).jpg",
        altEn: "Agency pack frame 1",
        altDe: "Agentur-Pack Frame 1",
      },
      {
        src: "/images/hero (19).jpg",
        altEn: "Agency pack frame 2",
        altDe: "Agentur-Pack Frame 2",
      },
      {
        src: "/images/hero (13).jpg",
        altEn: "Agency pack frame 3",
        altDe: "Agentur-Pack Frame 3",
      },
      {
        src: "/images/hero (20).jpg",
        altEn: "Agency pack frame 4",
        altDe: "Agentur-Pack Frame 4",
      },
    ],
    labelEn: "Creator gallery",
    labelDe: "Creator Gallery",
    gridClass: "sm:col-span-2",
  },
  {
    type: "before_after",
    id: "prompt-food",
    categoryId: "food",
    beforeSrc: "/images/hero (2).jpg",
    afterSrc: "/images/hero (15).jpg",
    promptEn: "Warm café flat lay → premium menu hero shot",
    promptDe: "Warmer Café-Flatlay → Premium-Menü-Hero",
    labelEn: "Prompt refine",
    labelDe: "Prompt-Verfeinerung",
    gridClass: "sm:col-span-2",
  },
  {
    type: "image_variant",
    id: "variant-beauty",
    categoryId: "beauty",
    src: "/assets/hero-model1.png.jpg",
    labelEn: "Look A · Feed",
    labelDe: "Look A · Feed",
  },
  {
    type: "image_variant",
    id: "variant-fitness",
    categoryId: "fitness",
    src: "/images/hero (10).png",
    labelEn: "Look A · Reels",
    labelDe: "Look A · Reels",
  },
  {
    type: "image_variant",
    id: "variant-ecommerce",
    categoryId: "ecommerce",
    src: "/images/hero (19).jpg",
    labelEn: "Product · Feed",
    labelDe: "Produkt · Feed",
  },
] as const;

export const LANDING_MEDIA_IMAGE_FALLBACK = SHOWCASE_VARIATION_IMAGE_FALLBACK;
