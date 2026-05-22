"use client";

import React from "react";

import {
  Sparkles,
  ImageIcon,
  Video,
  Brain,
  Wand2,
  ArrowUpRight,
} from "lucide-react";

const features = [

  {
    title: "Create Image",

    description:
      "Generate cinematic influencer visuals powered by advanced AI rendering systems.",

    icon: ImageIcon,

    glow:
      "from-[#c7a36a]/20 to-orange-500/10",
  },

  {
    title: "Create Video",

    description:
      "Transform prompts into viral cinematic AI videos optimized for creators.",

    icon: Video,

    glow:
      "from-purple-500/20 to-pink-500/10",
  },

  {
    title: "Character AI",

    description:
      "Persistent identity memory with cinematic consistency across generations.",

    icon: Brain,

    glow:
      "from-blue-500/20 to-cyan-500/10",
  },

  {
    title: "Prompt Intelligence",

    description:
      "AI enhanced prompting optimized for realism and cinematic aesthetics.",

    icon: Wand2,

    glow:
      "from-emerald-500/20 to-green-500/10",
  },
];

const models = [
  "FLUX Pro",
  "SDXL",
  "Ideogram",
  "GPT Image",
  "Runway",
  "Kling",
  "Veo",
  "Sora",
];

export default function FeatureSection() {

  return (

    <section className="relative py-32 overflow-hidden">

      {/* BACKGROUND */}

      <div className="absolute inset-0">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c7a36a]/5 blur-[140px]" />

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
              AI Tools
            </span>

          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-[-0.05em] leading-[0.95] mb-8">

            Build
            <br />

            Viral AI Content

          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">

            Powerful cinematic AI tools designed for creators,
            influencers and next generation digital brands.

          </p>

        </div>

        {/* FEATURES */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">

          {features.map((feature) => {

            const Icon =
              feature.icon;

            return (

              <div
                key={feature.title}

                className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 hover:scale-[1.02] transition duration-500"
              >

                {/* GLOW */}

                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${feature.glow}`} />

                <div className="relative">

                  {/* ICON */}

                  <div className="w-20 h-20 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center mb-8">

                    <Icon
                      size={34}
                      className="text-[#c7a36a]"
                    />

                  </div>

                  {/* TITLE */}

                  <div className="flex items-center justify-between mb-6">

                    <h3 className="text-3xl font-bold">
                      {feature.title}
                    </h3>

                    <ArrowUpRight
                      className="text-gray-500 group-hover:text-white transition"
                      size={24}
                    />

                  </div>

                  {/* DESCRIPTION */}

                  <p className="text-gray-400 leading-relaxed text-lg">

                    {feature.description}

                  </p>

                </div>

              </div>
            );
          })}

        </div>

        {/* MODELS */}

        <div className="text-center">

          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-10">
            Powered by leading AI models
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">

            {models.map((model) => (

              <div
                key={model}

                className="px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur"
              >

                <span className="text-lg font-semibold">
                  {model}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}