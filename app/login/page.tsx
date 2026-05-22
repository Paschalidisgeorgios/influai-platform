"use client";

import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);

    const {
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {

      alert(error.message);

      setLoading(false);

      return;
    }

    router.push("/dashboard");
  }

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-[#080808] border border-[#1a1a1a] rounded-3xl p-10">

        {/* HEADER */}

        <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
          InfluAI
        </p>

        <h1 className="text-5xl font-bold mb-4">
          Login
        </h1>

        <p className="text-gray-500 mb-10">
          Access your AI creator workspace.
        </p>

        {/* FORM */}

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          {/* EMAIL */}

          <div>

            <label className="block text-sm mb-3 text-gray-400">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-black border border-[#1a1a1a] rounded-2xl px-5 py-4 outline-none focus:border-[#c7a36a]"
            />

          </div>

          {/* PASSWORD */}

          <div>

            <label className="block text-sm mb-3 text-gray-400">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full bg-black border border-[#1a1a1a] rounded-2xl px-5 py-4 outline-none focus:border-[#c7a36a]"
            />

          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c7a36a] text-black font-semibold py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* FOOTER */}

        <div className="mt-8 text-center text-gray-500">

          No account yet?

          <Link
            href="/signup"
            className="text-[#c7a36a] ml-2"
          >
            Sign up
          </Link>

        </div>

      </div>

    </main>
  );
}