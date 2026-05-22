"use client";

import React from "react";

import {
  Sparkles,
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

    <section className="relative py-32 overflow-hidden">

      {/* BACKGROUND */}

      <div className="absolute inset-0">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-purple-500/5 blur-[180px]" />

      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* HEADER */}

        <div className="text-center mb-24">

          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#c7a36a]/20 bg-[#1a140d]/50 mb-8">

            <Sparkles
              size={16}
              className="text-[#c7a36a]"
            />

            <span className="text-sm text-[#c7a36a] uppercase tracking-[0.25em]">
              AI Showcase
            </span>

          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-[-0.05em] leading-[0.95] mb-8">

            Cinematic
            <br />

            AI Generations

          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">

            Explore ultra realistic cinematic visuals
            generated with advanced AI consistency systems.

          </p>

        </div>

        {/* MASONRY GRID */}

        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">

          {images.map((image, index) => (

            <div
              key={index}

              className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] break-inside-avoid"
            >

              {/* IMAGE */}

              <div className="relative overflow-hidden">

                <img
                  src={`${image}?w=1200&q=80&auto=format&fit=crop`}

                  alt="AI Generation"

                  className="w-full object-cover group-hover:scale-105 transition duration-700"
                />

                {/* OVERLAY */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

              </div>

              {/* CONTENT */}

              <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition duration-500">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[#c7a36a] uppercase tracking-[0.25em] text-xs mb-2">
                      AI Generated
                    </p>

                    <h3 className="text-2xl font-bold">
                      Cinematic Portrait
                    </h3>

                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">

                    <Sparkles
                      size={20}
                      className="text-[#c7a36a]"
                    />

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}