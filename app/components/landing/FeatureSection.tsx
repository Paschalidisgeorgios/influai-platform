"use client";

import Link from "next/link";

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
    title: "AI Visual Agent",
    description:
      "Generate premium campaign visuals from natural-language briefs with social format presets.",
    icon: ImageIcon,
    href: "/dashboard",
    glow: "from-[#c7a36a]/20 to-orange-500/10",
  },

  {
    title: "Style Profiles",
    description:
      "Define reusable creative direction for look, mood, styling and brand aesthetics.",
    icon: Brain,
    href: "/dashboard/characters",
    glow: "from-blue-500/20 to-cyan-500/10",
  },

  {
    title: "Prompt Intelligence",
    description:
      "Built-in prompt assistance helps refine briefs for luxury editorial quality before generation.",
    icon: Wand2,
    href: "/dashboard",
    glow: "from-emerald-500/20 to-green-500/10",
  },

  {
    title: "Asset Gallery",
    description:
      "Browse, favorite, and manage every image you create — owned by your account only.",
    icon: ImageIcon,
    href: "/dashboard",
    glow: "from-purple-500/20 to-pink-500/10",
  },
];

const stack = [
  "AI Agent",
  "Style Profiles",
  "Social Formats",
  "Asset Gallery",
  "Credits",
];

export default function FeatureSection() {

  return (

    <section className="relative py-24 md:py-32 overflow-hidden">

      <div className="absolute inset-0">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c7a36a]/5 blur-[140px]" />

      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">

        <div className="text-center mb-20 md:mb-24">

          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#c7a36a]/20 bg-[#1a140d]/50 mb-8">

            <Sparkles
              size={16}
              className="text-[#c7a36a]"
            />

            <span className="text-sm text-[#c7a36a] uppercase tracking-[0.25em]">
              Platform Tools
            </span>

          </div>

          <h2 className="text-4xl md:text-7xl font-black tracking-[-0.05em] leading-[0.95] mb-8">

            Explore studio
            <br />

            capabilities

          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">

            AI Agent, Style Profiles, Social Formats, Asset Gallery and Credits —
            the core workflow for campaign-ready visuals.

          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20 md:mb-24">

          {features.map((feature) => {

            const Icon = feature.icon;

            return (

              <Link
                key={feature.title}
                href={feature.href}

                className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition duration-500 hover:scale-[1.02] hover:border-[#d8ad5f]"
              >

                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${feature.glow}`} />

                <div className="relative">

                  <div className="w-20 h-20 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center mb-8">

                    <Icon
                      size={34}
                      className="text-[#c7a36a]"
                    />

                  </div>

                  <div className="flex items-center justify-between mb-6">

                    <h3 className="text-2xl md:text-3xl font-bold">
                      {feature.title}
                    </h3>

                    <ArrowUpRight
                      className="text-gray-500 transition group-hover:text-[#d8ad5f]"
                      size={24}
                    />

                  </div>

                  <p className="text-gray-400 leading-relaxed text-base md:text-lg">

                    {feature.description}

                  </p>

                </div>

              </Link>
            );
          })}

        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-12 text-center">

          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-6">
            Powered by
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-8">

            {stack.map((item) => (

              <div
                key={item}
                className="px-5 py-3 md:px-6 md:py-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur"
              >

                <span className="text-base md:text-lg font-semibold">
                  {item}
                </span>

              </div>

            ))}

          </div>

          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-white/10 bg-black/40 text-gray-400 text-sm">

            <Video size={16} className="text-[#c7a36a]" />

            Video Studio &amp; Lip Sync — coming soon

          </div>

        </div>

      </div>

    </section>
  );
}
