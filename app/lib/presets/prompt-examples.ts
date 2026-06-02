/**

 * Starter prompt examples by output type.

 */



import { getModeOutputType } from "@/app/lib/model-modes/mode-copy";



export type PromptExample = {

  id: string;

  text: { en: string; de: string };

};



export const IMAGE_STARTER_PROMPTS: readonly PromptExample[] = [

  {

    id: "ecommerce_hero",

    text: {

      en: "wireless earbuds catalog hero on matte stone, soft side light",

      de: "Wireless Earbuds Katalog-Hero auf mattem Stein, weiches Seitenlicht",

    },

  },

  {

    id: "food_hero",

    text: {

      en: "restaurant dish hero shot with natural window light and steam detail",

      de: "Restaurant-Gericht Hero-Shot mit natürlichem Fensterlicht und Dampf-Detail",

    },

  },

  {

    id: "street_fashion",

    text: {

      en: "streetwear outfit photo in an urban setting, bold typography space",

      de: "Streetwear-Outfit-Foto in urbaner Umgebung, Platz für bold Typografie",

    },

  },

  {

    id: "fitness_promo",

    text: {

      en: "fitness creator promo visual with bold gym lighting",

      de: "Fitness-Creator-Promo-Visual mit markantem Gym-Licht",

    },

  },

  {

    id: "real_estate_interior",

    text: {

      en: "bright real-estate interior wide shot with natural daylight",

      de: "Helle Immobilien-Innenaufnahme Weitwinkel mit Tageslicht",

    },

  },

  {

    id: "saas_desk_visual",

    text: {

      en: "SaaS dashboard mock on laptop, clean desk, LinkedIn-ready framing",

      de: "SaaS-Dashboard-Mock auf Laptop, cleanes Desk, LinkedIn-ready Framing",

    },

  },

];



export const VIDEO_STARTER_PROMPTS: readonly PromptExample[] = [

  {

    id: "ugc_unboxing",

    text: {

      en: "authentic UGC creator unboxing a lifestyle product, handheld reel feel",

      de: "Authentisches UGC-Creator-Unboxing eines Lifestyle-Produkts, Handheld-Reel-Feel",

    },

  },

  {

    id: "automotive_teaser",

    text: {

      en: "automotive social teaser with slow pan across a sedan at golden hour",

      de: "Automotive-Social-Teaser mit langsamem Pan über Limousine zur Golden Hour",

    },

  },

  {

    id: "beauty_product_reveal",

    text: {

      en: "beauty product bottle reveal with soft studio lighting",

      de: "Beauty-Produktflaschen-Reveal mit weichem Studiolicht",

    },

  },

  {

    id: "fitness_dynamic",

    text: {

      en: "fitness creator promo with dynamic motion and bold energy",

      de: "Fitness-Creator-Promo mit dynamischer Bewegung und bold Energy",

    },

  },

  {

    id: "sneaker_rotation",

    text: {

      en: "sneaker product video with rotating camera movement",

      de: "Sneaker-Produktvideo mit rotierender Kamerabewegung",

    },

  },

  {

    id: "food_reel",

    text: {

      en: "short food reel with overhead pour shot and warm kitchen light",

      de: "Kurzes Food-Reel mit Overhead-Pour-Shot und warmem Küchenlicht",

    },

  },

];



export function getStarterPromptsForModelMode(

  modelModeId: string

): PromptExample[] {

  const outputType = getModeOutputType(modelModeId);

  if (outputType === "video") return [...VIDEO_STARTER_PROMPTS];

  return [...IMAGE_STARTER_PROMPTS];

}



export function getStarterPromptText(

  example: PromptExample,

  language: "en" | "de"

): string {

  return language === "de" ? example.text.de : example.text.en;

}

