/**

 * White-label Image Studio catalog — maps UI engine ids → Krea registry targets.

 * Single picker source for Image Studio; registry holds API paths + availability.

 */



import type { ModelAvailability } from "./krea-model-registry";



export type KreaImageStudioModel = {

  id: string;

  label: string;

  provider: "krea";

  /** Registry model id, `auto` for smart resolver, or `smart_auto_pilot` */

  targetRegistryId: string;

  tool: "image";

  credits: number;

  availability: ModelAvailability;

  descriptionEn: string;

  descriptionDe: string;

  isRecommended?: boolean;

};



/** Verified active: flux_1_1_pro_ultra → krea-2-large, nano_realtime_render → nano-banana */

export const KREA_IMAGE_MODELS: readonly KreaImageStudioModel[] = [

  {

    id: "flux_1_1_pro_ultra",

    label: "Flux 1.1 Pro Ultra",

    provider: "krea",

    targetRegistryId: "krea-2-large",

    tool: "image",

    credits: 3,

    availability: "active",

    descriptionEn: "Premium engine for realistic campaign visuals.",

    descriptionDe: "Premium-Engine für realistische Kampagnenvisuals.",

    isRecommended: true,

  },

  {

    id: "flux_2_pro",

    label: "Flux 2 Pro",

    provider: "krea",

    targetRegistryId: "flux-2-pro",

    tool: "image",

    credits: 4,

    availability: "not_configured",

    descriptionEn: "Next-gen Flux Pro — coming soon.",

    descriptionDe: "Flux Pro der nächsten Generation — demnächst.",

  },

  {

    id: "flux_2_dev",

    label: "Flux 2 Dev",

    provider: "krea",

    targetRegistryId: "flux-2-dev",

    tool: "image",

    credits: 2,

    availability: "not_configured",

    descriptionEn: "Fast Flux 2 dev tier — coming soon.",

    descriptionDe: "Schnelle Flux-2-Dev-Stufe — demnächst.",

  },

  {

    id: "flux_fast_draft",

    label: "Flux Fast Draft",

    provider: "krea",

    targetRegistryId: "krea-2-medium",

    tool: "image",

    credits: 1,

    availability: "active",

    descriptionEn: "Fast drafts and clean layout concepts.",

    descriptionDe: "Schnelle Entwürfe und saubere Layout-Konzepte.",

  },

  {

    id: "nano_banana_pro",

    label: "Nano Banana Pro",

    provider: "krea",

    targetRegistryId: "nano-banana-pro",

    tool: "image",

    credits: 5,

    availability: "experimental",

    descriptionEn: "Reference-aware semantic edits and generation.",

    descriptionDe: "Referenz-bewusste semantische Bearbeitung.",

  },

  {

    id: "nano_banana_2",

    label: "Nano Banana 2",

    provider: "krea",

    targetRegistryId: "nano-banana-2",

    tool: "image",

    credits: 2,

    availability: "experimental",

    descriptionEn: "Updated Nano concept pipeline.",

    descriptionDe: "Aktualisierte Nano-Konzept-Pipeline.",

  },

  {

    id: "nano_realtime_render",

    label: "Nano Realtime Render",

    provider: "krea",

    targetRegistryId: "nano-banana",

    tool: "image",

    credits: 2,

    availability: "active",

    descriptionEn: "Fast concept generation for creative directions.",

    descriptionDe: "Schnelle Konzeptgenerierung für kreative Richtungen.",

  },

  {

    id: "imagen_4_ultra",

    label: "Imagen 4 Ultra",

    provider: "krea",

    targetRegistryId: "imagen-4-ultra",

    tool: "image",

    credits: 4,

    availability: "experimental",

    descriptionEn: "Highest fidelity Google Imagen tier.",

    descriptionDe: "Höchste Google-Imagen-Qualitätsstufe.",

  },

  {

    id: "imagen_4_fast",

    label: "Imagen 4 Fast",

    provider: "krea",

    targetRegistryId: "imagen-4-fast",

    tool: "image",

    credits: 2,

    availability: "experimental",

    descriptionEn: "Speed-optimized Imagen generation.",

    descriptionDe: "Geschwindigkeits-optimierte Imagen-Generierung.",

  },

  {

    id: "gpt_img_2",

    label: "GPT-IMG-2",

    provider: "krea",

    targetRegistryId: "gpt-image-2",

    tool: "image",

    credits: 5,

    availability: "not_configured",

    descriptionEn: "Disabled — not enabled for this workspace.",

    descriptionDe: "Deaktiviert — für diesen Workspace nicht freigeschaltet.",

  },

  {

    id: "recraft_v41",

    label: "Recraft V4.1",

    provider: "krea",

    targetRegistryId: "recraft-v41",

    tool: "image",

    credits: 3,

    availability: "not_configured",

    descriptionEn: "Vector and brand design engine — coming soon.",

    descriptionDe: "Vektor- und Brand-Design-Engine — demnächst.",

  },

  {

    id: "smart_auto_pilot",

    label: "Smart Auto-Pilot",

    provider: "krea",

    targetRegistryId: "smart_auto_pilot",

    tool: "image",

    credits: 1,

    availability: "active",

    descriptionEn: "Auto-routes to a verified default engine.",

    descriptionDe: "Nutzt automatisch eine verifizierte Standard-Engine.",

  },

  {

    id: "creator_photo_engine",

    label: "Creator Photo Engine",

    provider: "krea",

    targetRegistryId: "krea-1",

    tool: "image",

    credits: 2,

    availability: "not_configured",

    descriptionEn: "Creator-focused photo engine — coming soon.",

    descriptionDe: "Creator-fokussierte Foto-Engine — demnächst.",

  },

  {

    id: "campaign_visual_engine",

    label: "Campaign Visual Engine",

    provider: "krea",

    targetRegistryId: "krea-2-large",

    tool: "image",

    credits: 3,

    availability: "experimental",

    descriptionEn: "Campaign-grade expressive photorealism.",

    descriptionDe: "Kampagnen-tauglicher expressiver Fotorealismus.",

  },

  {

    id: "qwen_image_2512",

    label: "Qwen Image 2512",

    provider: "krea",

    targetRegistryId: "qwen-2512",

    tool: "image",

    credits: 1,

    availability: "experimental",

    descriptionEn: "Efficient Qwen text-to-image.",

    descriptionDe: "Effiziente Qwen Text-zu-Bild-Generierung.",

  },

] as const;



export const SMART_AUTO_PILOT_STUDIO_ID = "smart_auto_pilot";



const STUDIO_BY_ID = new Map(KREA_IMAGE_MODELS.map((entry) => [entry.id, entry]));



export function getKreaImageStudioModel(id: string): KreaImageStudioModel | undefined {

  return STUDIO_BY_ID.get(id.trim());

}



export function getDefaultKreaImageStudioModel(): KreaImageStudioModel {

  return (

    KREA_IMAGE_MODELS.find((m) => m.isRecommended && m.availability === "active") ??

    KREA_IMAGE_MODELS.find((m) => m.availability === "active") ??

    KREA_IMAGE_MODELS[0]

  );

}



/** Verified fallback registry ids for Smart Auto-Pilot (tested engines only). */

export function resolveSmartAutoPilotRegistryId(): string {

  return "nano-banana";

}



export function resolveKreaImageStudioTargetRegistryId(

  studioModel: KreaImageStudioModel

): string {

  if (

    studioModel.id === SMART_AUTO_PILOT_STUDIO_ID ||

    studioModel.targetRegistryId === "smart_auto_pilot" ||

    studioModel.targetRegistryId === "auto"

  ) {

    return resolveSmartAutoPilotRegistryId();

  }

  return studioModel.targetRegistryId;

}



export function isSmartAutoPilotStudioId(id: string): boolean {

  return id.trim() === SMART_AUTO_PILOT_STUDIO_ID;

}


