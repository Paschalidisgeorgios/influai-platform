"use client";



import Image from "next/image";

import { useState, type ComponentType } from "react";

import { motion } from "framer-motion";

import {

  Car,

  FlaskConical,

  ImageIcon,

  Monitor,

  Pause,

  Play,

  UtensilsCrossed,

  Video,

} from "lucide-react";

import type { LandingLanguage } from "./magnificContent";

import { magnificContent } from "./magnificContent";

import {

  HERO_LIVE_MODEL_IMAGE,

  HERO_LIVE_MODEL_IMAGE_FALLBACK,

  LANDING_VIDEO_MOTION_POSTER,

} from "./landingAssets";

import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";

import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";



const DEMO_CARD_IMAGES: Partial<Record<string, string>> = {

  ecommerce_product: HERO_LIVE_MODEL_IMAGE,

  streetwear_drop: "/assets/hero-streetfoto.png.png",

  food_visual: "/assets/hero-model2.png.jpg",

  fitness_creator: LANDING_VIDEO_MOTION_POSTER,

  automotive: LANDING_VIDEO_MOTION_POSTER,

};



const PLACEHOLDER_ICONS: Partial<

  Record<string, ComponentType<{ className?: string }>>

> = {

  saas_b2b: Monitor,

  food_visual: UtensilsCrossed,

  automotive: Car,

};



export default function CreatorGallerySection({

  currentLanguage,

}: {

  currentLanguage: LandingLanguage;

}) {

  const t = magnificContent[currentLanguage].creatorGallery;

  const [imageFallbacks, setImageFallbacks] = useState<Record<string, boolean>>(

    {}

  );



  return (

    <section

      id="creator-gallery"

      className={`border-t border-white/[0.06] bg-[#070A12] ${LANDING_LAYOUT.section}`}

    >

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <motion.div

          initial={{ opacity: 0, y: 16 }}

          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true, margin: "-40px" }}

          transition={OBS_SPRING}

          className="mx-auto max-w-3xl text-center"

        >

          <p className={PREMIUM_CLASSES.mono}>Creator Gallery</p>

          <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">

            {t.headline}

          </h2>

          <p className="mt-4 text-base leading-7 text-white/65">{t.body}</p>

          <p className="mt-2 text-xs text-white/40">{t.demoDisclaimer}</p>

        </motion.div>



        <div

          className={`${LANDING_LAYOUT.afterHeaderLg} grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`}

        >

          {t.cards.map((card, index) => {

            const isVideo = card.type === "video";

            const imageSrc = DEMO_CARD_IMAGES[card.id];

            const useFallback = imageFallbacks[card.id];

            const PlaceholderIcon =

              PLACEHOLDER_ICONS[card.id] ?? (isVideo ? Video : ImageIcon);



            return (

              <motion.article

                key={card.id}

                initial={{ opacity: 0, y: 14 }}

                whileInView={{ opacity: 1, y: 0 }}

                viewport={{ once: true }}

                transition={{ ...OBS_SPRING, delay: index * 0.05 }}

                className={`overflow-hidden ${PREMIUM_CLASSES.glassCard}`}

                aria-hidden

              >

                <div className="relative aspect-[4/3] w-full bg-[#0E1220]">

                  {imageSrc ? (

                    <Image

                      src={

                        useFallback ? HERO_LIVE_MODEL_IMAGE_FALLBACK : imageSrc

                      }

                      alt=""

                      fill

                      className="object-cover"

                      sizes="(max-width: 640px) 100vw, 320px"

                      unoptimized

                      onError={() =>

                        setImageFallbacks((prev) => ({ ...prev, [card.id]: true }))

                      }

                    />

                  ) : (

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#111827] via-[#0E1220] to-[#1e293b]">

                      <PlaceholderIcon

                        className="h-8 w-8 text-white/25"

                        aria-hidden

                      />

                      <span className="text-[10px] font-medium text-white/35">

                        {card.category}

                      </span>

                    </div>

                  )}



                  {isVideo ? (

                    <>

                      <div className="absolute inset-0 bg-gradient-to-t from-[#070A12]/80 via-transparent to-transparent" />

                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 backdrop-blur-sm">

                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">

                          <Play className="h-3.5 w-3.5" aria-hidden />

                        </span>

                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">

                          <div className="h-full w-[38%] rounded-full bg-[#8B5CF6]" />

                        </div>

                        <Pause className="h-3.5 w-3.5 text-white/50" aria-hidden />

                      </div>

                    </>

                  ) : null}



                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">

                    {isVideo ? (

                      <Video className="h-3 w-3" aria-hidden />

                    ) : (

                      <ImageIcon className="h-3 w-3" aria-hidden />

                    )}

                    {isVideo ? "Video" : "Image"}

                  </span>



                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">

                    <FlaskConical className="h-2.5 w-2.5" aria-hidden />

                    {t.demoLabel}

                  </span>

                </div>



                <div className="space-y-2 p-4">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">

                    {card.category}

                  </p>

                  <p className="line-clamp-2 text-xs text-white/55">

                    &ldquo;{card.promptSnippet}&rdquo;

                  </p>

                  <p

                    className={`text-[10px] font-semibold uppercase tracking-wide ${

                      isVideo ? "text-[#22D3EE]/80" : "text-[#8B5CF6]/80"

                    }`}

                  >

                    {card.studioLabel}

                  </p>

                </div>

              </motion.article>

            );

          })}

        </div>

      </div>

    </section>

  );

}

