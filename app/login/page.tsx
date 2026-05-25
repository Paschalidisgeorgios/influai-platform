"use client";

import Link from "next/link";
import { useState } from "react";
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
      setStatusMessage("Signing in to your studio...");
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
      setStatusMessage("Sign-in successful. Opening InfluExAi Studio...");

      window.setTimeout(() => {
        window.location.replace("/dashboard");
      }, 600);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Sign-in failed. Please try again.");
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
        className="absolute left-5 top-5 z-20 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/80 transition hover:border-[#d8ad5f]/40 hover:text-white"
      >
        Back to Home
      </Link>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/60 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#d8ad5f]">
            InfluExAi
          </p>

          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/35">
            AI Creator Studio
          </p>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            Sign in
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/55">
            Access your studio for the AI Visual Agent, Style Profiles, Social
            Formats, Asset Gallery and Credits.
          </p>

          {statusMessage && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white">
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
              {errorMessage}
            </div>
          )}

          {loginSuccess && (
            <Link
              href="/dashboard"
              className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-white text-sm font-black text-black transition hover:bg-white/80"
            >
              Open Studio
            </Link>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
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
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm outline-none transition focus:border-[#d8ad5f]/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#d8ad5f] text-sm font-black text-black transition hover:bg-[#f0c979] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to Studio"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/45">
            No account yet?{" "}
            <Link href="/signup" className="font-bold text-[#d8ad5f]">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
