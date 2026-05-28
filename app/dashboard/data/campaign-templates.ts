export type CampaignTemplate = {
  id: string;
  titleEn: string;
  titleDe: string;
  bodyEn: string;
  bodyDe: string;
  prompt: string;
};

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "fitness",
    titleEn: "Fitness Creator Campaign",
    titleDe: "Fitness Creator Campaign",
    bodyEn: "Premium fitness visual for Instagram and sportswear brands.",
    bodyDe: "Premium-Fitness-Visual für Instagram und Sportmarken.",
    prompt:
      "Create a premium fitness creator campaign visual for Instagram featuring a confident athlete, luxury sportswear, cinematic gym lighting and a clean product-focused composition.",
  },
  {
    id: "ugc-product",
    titleEn: "UGC Product Ad",
    titleDe: "UGC Product Ad",
    bodyEn: "Authentic creator-style product recommendation for social ads.",
    bodyDe: "Authentische Creator-Empfehlung für Social Ads.",
    prompt:
      "Create an authentic UGC-style creator image showing a product recommendation in a real everyday setting, natural smartphone look and organic social media feel.",
  },
  {
    id: "luxury-product",
    titleEn: "Luxury Product Visual",
    titleDe: "Luxury Product Visual",
    bodyEn: "High-end product campaign with premium lighting and materials.",
    bodyDe: "High-End-Produktkampagne mit Premium-Licht und Materialien.",
    prompt:
      "Create a high-end product campaign visual with premium lighting, clean composition, elegant materials and strong product focus.",
  },
  {
    id: "beauty-launch",
    titleEn: "Beauty Launch",
    titleDe: "Beauty Launch",
    bodyEn: "Clean skincare or cosmetics launch with refined styling.",
    bodyDe: "Clean Beauty-Launch für Skincare oder Kosmetik.",
    prompt:
      "Create a clean beauty launch visual for skincare or cosmetics, soft premium lighting, elegant product focus and refined campaign styling.",
  },
  {
    id: "restaurant",
    titleEn: "Restaurant Promo",
    titleDe: "Restaurant Promo",
    bodyEn: "Appetizing food visual for local restaurant campaigns.",
    bodyDe: "Appetitliches Food-Visual für lokale Restaurant-Kampagnen.",
    prompt:
      "Create a social media visual for a local restaurant campaign, appetizing food presentation, warm atmosphere and inviting composition.",
  },
  {
    id: "local-business",
    titleEn: "Local Business Ad",
    titleDe: "Local Business Ad",
    bodyEn: "Friendly premium look for local service promotions.",
    bodyDe: "Freundlicher Premium-Look für lokale Service-Promos.",
    prompt:
      "Create a campaign visual for a local business promotion, clear service focus, friendly premium look and social-media-ready composition.",
  },
  {
    id: "youtube-thumbnail",
    titleEn: "YouTube Thumbnail",
    titleDe: "YouTube Thumbnail",
    bodyEn: "High-impact thumbnail with strong visual hierarchy.",
    bodyDe: "High-Impact-Thumbnail mit starker visueller Hierarchie.",
    prompt:
      "Create a high-impact YouTube thumbnail concept with strong visual hierarchy, dramatic contrast and space for future title text.",
  },
  {
    id: "fashion",
    titleEn: "Fashion Campaign",
    titleDe: "Fashion Campaign",
    bodyEn: "Editorial fashion visual for premium social campaigns.",
    bodyDe: "Editorial Fashion-Visual für Premium-Social-Kampagnen.",
    prompt:
      "Create a premium fashion campaign visual with editorial styling, confident model energy and high-end social media composition.",
  },
];
