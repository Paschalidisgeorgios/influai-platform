"use client";

import Link from "next/link";

import {
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function CTASection() {

  return (

    <section className="relative py-28 md:py-40 overflow-hidden border-t border-white/5">

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-[#c7a36a]/10 blur-[180px]" />

        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-500/10 blur-[160px] rounded-full" />

      </div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-6 text-center">

        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#c7a36a]/20 bg-[#1a140d]/50 mb-10">

          <Sparkles
            size={16}
            className="text-[#c7a36a]"
          />

          <span className="text-sm text-[#c7a36a] uppercase tracking-[0.25em]">
            AI Creator Studio
          </span>

        </div>

        <h2 className="text-4xl md:text-7xl font-black tracking-[-0.05em] leading-[0.95] mb-10">

          Open your
          <br />

          <span className="bg-gradient-to-r from-[#c7a36a] via-white to-[#c7a36a] bg-clip-text text-transparent">
            InfluExAi Studio
          </span>

        </h2>

        <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-14">

          Generate campaign visuals with the AI Agent, Style Profiles, Social
          Formats, Asset Gallery and Credits.

        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">

          <Link
            href="/dashboard"
            className="group flex items-center gap-4 rounded-2xl bg-[#d8ad5f] px-8 py-4 text-lg font-bold text-black transition hover:scale-[1.03] hover:bg-[#efc777] md:px-10 md:py-5"
          >
            Open Studio
            <ArrowRight
              size={22}
              className="group-hover:translate-x-1 transition"
            />
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-lg backdrop-blur transition hover:border-[#d8ad5f] hover:bg-[#d8ad5f] hover:text-black md:px-10 md:py-5"
          >
            Start creating
          </Link>

          <a
            href="#tools"
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-lg backdrop-blur transition hover:border-[#d8ad5f] hover:bg-[#d8ad5f] hover:text-black md:px-10 md:py-5"
          >
            Explore features
          </a>

        </div>

      </div>

    </section>
  );
}
