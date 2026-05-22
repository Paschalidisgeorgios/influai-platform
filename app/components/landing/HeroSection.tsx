"use client";

import Link from "next/link";

import {
  Sparkles,
  Wand2,
  Brain,
  ImageIcon,
} from "lucide-react";

const capabilities = [
  {
    label: "Persistent Characters",
    value: "Identity",
  },
  {
    label: "AI Prompt Intelligence",
    value: "Enhanced",
  },
  {
    label: "Multi-Image Generation",
    value: "4 Variations",
  },
];

export default function HeroSection() {

  return (

    <section className="relative overflow-hidden border-b border-white/5">

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#c7a36a]/10 blur-[120px] rounded-full" />

        <div className="absolute bottom-[-300px] right-[-200px] w-[600px] h-[600px] bg-purple-500/10 blur-[160px] rounded-full" />

      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">

        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#c7a36a]/20 bg-[#1a140d]/50 mb-10">

          <Sparkles
            size={16}
            className="text-[#c7a36a]"
          />

          <span className="text-sm text-[#c7a36a] uppercase tracking-[0.25em]">
            AI Creator Platform
          </span>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          <div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.95] tracking-[-0.05em] mb-8">

              Create
              <br />

              <span className="bg-gradient-to-r from-[#c7a36a] via-white to-[#c7a36a] bg-clip-text text-transparent">
                Cinematic
              </span>

              <br />

              AI Content

            </h1>

            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">

              Generate luxury editorial visuals with persistent
              character consistency, AI prompt intelligence, and
              multi-image FLUX generation — built for creators and brands.

            </p>

            <div className="flex flex-wrap gap-4 mb-14">

              <Link
                href="/dashboard/image-generator"
                className="px-8 py-5 rounded-2xl bg-[#c7a36a] text-black font-bold hover:scale-[1.03] transition"
              >
                Start Creating
              </Link>

              <Link
                href="/dashboard/gallery"
                className="px-8 py-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition"
              >
                Explore Gallery
              </Link>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

              {capabilities.map((item) => (

                <div key={item.label}>

                  <p className="text-2xl md:text-3xl font-black text-[#c7a36a] mb-2">
                    {item.value}
                  </p>

                  <p className="text-gray-500 text-sm uppercase tracking-[0.2em]">
                    {item.label}
                  </p>

                </div>

              ))}

            </div>

          </div>

          <div className="relative">

            <div className="relative rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 overflow-hidden">

              <div className="absolute inset-0 bg-gradient-to-br from-[#c7a36a]/10 to-purple-500/10" />

              <div className="relative">

                <div className="flex items-center justify-between mb-10">

                  <div>

                    <p className="text-[#c7a36a] uppercase tracking-[0.25em] text-xs mb-3">
                      AI ENGINE
                    </p>

                    <h3 className="text-2xl md:text-3xl font-bold">
                      Cinematic Generation
                    </h3>

                  </div>

                  <div className="w-4 h-4 rounded-full bg-[#c7a36a] animate-pulse" />

                </div>

                <div className="aspect-[4/5] rounded-[30px] bg-gradient-to-br from-[#1a140d] to-[#0f0f0f] border border-white/5 mb-8 flex items-center justify-center">

                  <div className="text-center px-6">

                    <div className="w-24 h-24 rounded-3xl bg-[#c7a36a]/10 flex items-center justify-center mx-auto mb-6">

                      <ImageIcon
                        size={42}
                        className="text-[#c7a36a]"
                      />

                    </div>

                    <p className="text-gray-400 max-w-xs mx-auto">
                      FLUX-powered multi-image generation with character memory and prompt intelligence.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-white/5 bg-black/30 p-5">

                    <Brain
                      className="text-[#c7a36a] mb-4"
                      size={22}
                    />

                    <p className="font-semibold mb-2">
                      Character Memory
                    </p>

                    <p className="text-sm text-gray-500">
                      Persistent identity system
                    </p>

                  </div>

                  <div className="rounded-2xl border border-white/5 bg-black/30 p-5">

                    <Wand2
                      className="text-[#c7a36a] mb-4"
                      size={22}
                    />

                    <p className="font-semibold mb-2">
                      Prompt Intelligence
                    </p>

                    <p className="text-sm text-gray-500">
                      OpenAI-enhanced prompts
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
