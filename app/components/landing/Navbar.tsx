"use client";

import { useState } from "react";

import Link from "next/link";

import {
  Sparkles,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/gallery", label: "Gallery" },
  { href: "/dashboard/image-generator", label: "Create" },
];

export default function Navbar() {

  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (

    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5">

      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">

        <Link
          href="/"
          className="flex items-center gap-3 md:gap-4"
        >

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#c7a36a] to-[#8b6b3f] flex items-center justify-center shadow-[0_0_40px_rgba(199,163,106,0.3)]">

            <Sparkles
              size={20}
              className="text-black"
            />

          </div>

          <div>

            <p className="text-[#c7a36a] uppercase tracking-[0.35em] text-[10px] mb-1">
              AI Creator Platform
            </p>

            <h1 className="text-lg md:text-xl font-black tracking-[-0.03em]">
              InfluAI
            </h1>

          </div>

        </Link>

        <nav className="hidden lg:flex items-center gap-10">

          {navLinks.map((link) => (

            <Link
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-white transition"
            >
              {link.label}
            </Link>

          ))}

        </nav>

        <div className="flex items-center gap-3 md:gap-4">

          <Link
            href="/login"
            className="hidden md:flex px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Login
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:flex px-5 md:px-6 py-3 rounded-2xl bg-[#c7a36a] text-black font-bold hover:scale-[1.03] transition"
          >
            Launch App
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl border border-white/10 bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>

      </div>

      {mobileOpen && (

        <div className="lg:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl px-4 py-6 space-y-4">

          {navLinks.map((link) => (

            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-gray-300 hover:text-white py-2"
            >
              {link.label}
            </Link>

          ))}

          <div className="flex flex-col gap-3 pt-4 border-t border-white/5">

            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="px-5 py-3 rounded-2xl border border-white/10 text-center"
            >
              Login
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="px-5 py-3 rounded-2xl bg-[#c7a36a] text-black font-bold text-center"
            >
              Launch App
            </Link>

          </div>

        </div>

      )}

    </header>
  );
}
