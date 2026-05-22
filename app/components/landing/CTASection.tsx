"use client";

import React from "react";

import Link from "next/link";

import {
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function CTASection() {

  return (

    <section className="relative py-40 overflow-hidden">

      {/* BACKGROUND */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-[#c7a36a]/10 blur-[180px]" />

        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-500/10 blur-[160px] rounded-full" />

      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* BADGE */}

        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#c7a36a]/20 bg-[#1a140d]/50 mb-10">

          <Sparkles
            size={16}
            className="text-[#c7a36a]"
          />

          <span className="text-sm text-[#c7a36a] uppercase tracking-[0.25em]">
            Start Creating
          </span>

        </div>

        {/* TITLE */}

        <h2 className="text-5xl md:text-7xl font-black tracking-[-0.05em] leading-[0.95] mb-10">

          Build Your
          <br />

          <span className="bg-gradient-to-r from-[#c7a36a] via-white to-[#c7a36a] bg-clip-text text-transparent">

            AI Creator Brand

          </span>

        </h2>

        {/* TEXT */}

        <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-14">

          Create cinematic AI content, persistent digital characters
          and viral visuals powered by next generation AI systems.

        </p>

        {/* CTA */}

        <div className="flex flex-wrap items-center justify-center gap-6">

          <Link
            href="/dashboard"

            className="group px-10 py-5 rounded-2xl bg-[#c7a36a] text-black font-bold text-lg hover:scale-[1.03] transition flex items-center gap-4"
          >

            Launch Platform

            <ArrowRight
              size={22}
              className="group-hover:translate-x-1 transition"
            />

          </Link>

          <Link
            href="/dashboard/gallery"

            className="px-10 py-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur hover:bg-white/[0.06] transition text-lg"
          >

            Explore Gallery

          </Link>

        </div>

      </div>

    </section>
  );
}