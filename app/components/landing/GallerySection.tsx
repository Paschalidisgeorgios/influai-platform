"use client";

import Link from "next/link";

import {
  Sparkles,
  ArrowRight,
} from "lucide-react";

const images = [

  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",

  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",

  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",

  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",

  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",

  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
];

export default function GallerySection() {

  return (

    <section className="relative py-24 md:py-32 overflow-hidden border-t border-white/5">

      <div className="absolute inset-0">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-purple-500/5 blur-[180px]" />

      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-24">

          <div className="text-center md:text-left">

            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#c7a36a]/20 bg-[#1a140d]/50 mb-8">

              <Sparkles
                size={16}
                className="text-[#c7a36a]"
              />

              <span className="text-sm text-[#c7a36a] uppercase tracking-[0.25em]">
                Style Showcase
              </span>

            </div>

            <h2 className="text-4xl md:text-7xl font-black tracking-[-0.05em] leading-[0.95] mb-6">

              Cinematic
              <br />

              Visual Direction

            </h2>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">

              Editorial-quality aesthetics your generator is tuned for.
              Your own creations live in your private gallery after generation.

            </p>

          </div>

          <Link
            href="/dashboard/gallery"
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-[#d8ad5f] px-8 py-4 font-bold text-black transition hover:scale-[1.03] hover:bg-[#efc777]"
          >
            View Your Gallery
            <ArrowRight size={20} />
          </Link>

        </div>

        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">

          {images.map((image, index) => (

            <div
              key={index}
              className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] break-inside-avoid"
            >

              <div className="relative overflow-hidden">

                <img
                  src={`${image}?w=1200&q=80&auto=format&fit=crop`}
                  alt="Editorial style reference"
                  className="w-full object-cover group-hover:scale-105 transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition duration-500">

                <p className="text-[#c7a36a] uppercase tracking-[0.25em] text-xs mb-2">
                  Style Reference
                </p>

                <h3 className="text-xl font-bold">
                  Luxury Editorial
                </h3>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}
