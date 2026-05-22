"use client";

import React from "react";

import Link from "next/link";

import {
  Sparkles,
} from "lucide-react";

export default function Navbar() {

  return (

    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5">

      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">

        {/* LOGO */}

        <Link
          href="/"
          className="flex items-center gap-4"
        >

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c7a36a] to-[#8b6b3f] flex items-center justify-center shadow-[0_0_40px_rgba(199,163,106,0.3)]">

            <Sparkles
              size={20}
              className="text-black"
            />

          </div>

          <div>

            <p className="text-[#c7a36a] uppercase tracking-[0.35em] text-[10px] mb-1">
              CineAI Studio
            </p>

            <h1 className="text-xl font-black tracking-[-0.03em]">
              INFLUA AI
            </h1>

          </div>

        </Link>

        {/* NAV */}

        <nav className="hidden lg:flex items-center gap-10">

          <Link
            href="/"
            className="text-gray-300 hover:text-white transition"
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            className="text-gray-300 hover:text-white transition"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/gallery"
            className="text-gray-300 hover:text-white transition"
          >
            Gallery
          </Link>

          <Link
            href="/dashboard/image-generator"
            className="text-gray-300 hover:text-white transition"
          >
            Create
          </Link>

        </nav>

        {/* CTA */}

        <div className="flex items-center gap-4">

          <Link
            href="/login"

            className="hidden md:flex px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >

            Login

          </Link>

          <Link
            href="/dashboard"

            className="px-6 py-3 rounded-2xl bg-[#c7a36a] text-black font-bold hover:scale-[1.03] transition"
          >

            Launch App

          </Link>

        </div>

      </div>

    </header>
  );
}