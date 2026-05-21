"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { supabase } from "@/app/lib/supabase";

export default function AuthPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function signUp() {

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {

      alert(error.message);

    } else {

      alert("Account created! Check your email.");
    }

    setLoading(false);
  }

  async function signIn() {

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {

      alert(error.message);

    } else {

      router.push("/dashboard");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-6">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#D6A35D22,transparent_35%)]" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-2xl"
      >

        {/* Header */}
        <div className="mb-10">

          <p className="text-sm uppercase tracking-[0.4em] text-[#D6A35D]">
            INFLUAI ACCESS
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-white">
            Welcome Back
          </h1>

          <p className="mt-4 text-zinc-500">
            Login or create your AI creator account.
          </p>

        </div>

        {/* Inputs */}
        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-zinc-600"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-zinc-600"
          />

        </div>

        {/* Buttons */}
        <div className="mt-8 space-y-4">

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full rounded-2xl bg-[#D6A35D] py-4 font-medium text-black transition hover:bg-[#e7b56f]"
          >

            {loading ? "Loading..." : "Login"}

          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 font-medium text-white transition hover:bg-white/[0.05]"
          >

            Create Account

          </button>

        </div>

      </motion.div>

    </div>
  );
}