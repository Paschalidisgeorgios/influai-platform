"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    // deine login logic bleibt später hier

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#d8ad5f]/20 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/80 transition hover:border-[#d8ad5f]/40 hover:text-white"
      >
        ← Back to Home
      </Link>

      {/* Center */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/60 p-7 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Brand */}
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#d8ad5f]">
            AIINFLUGEN
          </p>

          <h1 className="text-5xl font-black tracking-tight">
            Login
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/55">
            Access your AI creator workspace.
          </p>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm text-white/70">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm outline-none transition focus:border-[#d8ad5f]/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••••"
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm outline-none transition focus:border-[#d8ad5f]/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#d8ad5f] text-sm font-black text-black transition hover:bg-[#f0c979]"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          {/* Bottom */}
          <p className="mt-8 text-center text-sm text-white/45">
            No account yet?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#d8ad5f]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}