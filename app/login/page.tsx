"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setLoginSuccess(false);
      setStatusMessage("Signing in to InfluExAi Studio…");
      setErrorMessage(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setStatusMessage(null);
        return;
      }

      if (!data.session) {
        setErrorMessage("Sign-in failed. No session was created.");
        setStatusMessage(null);
        return;
      }

      setLoginSuccess(true);
      setStatusMessage("Signed in successfully. Opening your studio…");

      window.setTimeout(() => {
        window.location.replace("/dashboard");
      }, 600);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Sign-in failed. Please check your details and try again.");
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#d8ad5f]/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
      </div>

      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/80 transition hover:border-[#d8ad5f]/40 hover:text-[#d8ad5f] sm:left-5 sm:top-5"
      >
        Back to home
      </Link>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-5">
        <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-black/60 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-[2rem] sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d8ad5f] text-black">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#d8ad5f]">
                InfluExAi
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                AI Creator Studio
              </p>
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
            Sign in to Studio
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/55">
            Access the AI Agent, Social Formats, Style Profiles, Asset Gallery
            and Credits — your workspace for campaign-ready visuals.
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {[
              "AI Agent",
              "Social Formats",
              "Style Profiles",
              "Asset Gallery",
              "Credits",
            ].map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/50"
              >
                {item}
              </li>
            ))}
          </ul>

          {statusMessage && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white">
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
              {errorMessage}
            </div>
          )}

          {loginSuccess && (
            <Link
              href="/dashboard"
              className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#d8ad5f] text-sm font-black text-black transition hover:bg-[#efc777]"
            >
              Open Studio
            </Link>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Work email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm outline-none transition focus:border-[#d8ad5f]/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
                autoComplete="current-password"
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm outline-none transition focus:border-[#d8ad5f]/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#d8ad5f] text-sm font-black text-black transition hover:bg-[#f0c979] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/45">
            No account yet?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#d8ad5f] transition hover:text-[#efc777]"
            >
              Create account
            </Link>
          </p>

          <p className="mt-6 text-center text-xs leading-5 text-white/30">
            Secure sign-in for the InfluExAi Creator Studio. One standard image
            = one credit.
          </p>
        </div>
      </div>
    </main>
  );
}
