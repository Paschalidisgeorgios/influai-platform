/** Gallery filters and notices — provider-neutral. */

export const GALLERY_FILTERS = {
  all: { en: "All", de: "Alle" },
  images: { en: "Images", de: "Bilder" },
  videos: { en: "Videos", de: "Videos" },
  packs: { en: "Packs", de: "Packs" },
  favorites: { en: "Favorites", de: "Favoriten" },
} as const;

export const GALLERY_NOTICES = {
  promptCopied: { en: "Prompt copied.", de: "Prompt kopiert." },
  promptMissing: {
    en: "No prompt to copy for this asset.",
    de: "Kein Prompt für dieses Asset vorhanden.",
  },
  packBadge: { en: "Pack", de: "Pack" },
} as const;

export const GALLERY_FILTER_EMPTY = {
  en: "No assets match this filter. Try another view or clear your search.",
  de: "Keine Assets für diesen Filter. Probiere eine andere Ansicht oder lösche die Suche.",
} as const;

export const GALLERY_EMPTY_ACTIONS = {
  createImage: { en: "Create image", de: "Bild erstellen" },
  createVideo: { en: "Create motion video", de: "Motion-Video erstellen" },
  createPack: { en: "Social Asset Pack", de: "Social Asset Pack" },
  clearFilters: { en: "Clear filters", de: "Filter zurücksetzen" },
} as const;
