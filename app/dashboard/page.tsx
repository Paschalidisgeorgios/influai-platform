"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/app/lib/supabase";

export default function DashboardPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");

  useEffect(() => {

    async function loadUser() {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {

        router.push("/auth");
        return;
      }

      setEmail(user.email || "");
    }

    loadUser();

  }, [router]);

  async function logout() {

    await supabase.auth.signOut();

    router.push("/auth");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#050505] p-10 text-white"
    >

      {/* Header */}
      <div className="mb-10 flex items-center justify-between">

        <div>

          <p className="text-sm uppercase tracking-[0.4em] text-[#D6A35D]">

            INFLUAI Creator Studio

          </p>

          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">

            Dashboard

          </h1>

          <p className="mt-4 text-zinc-500">

            Logged in as:
            <span className="ml-2 text-white">

              {email}

            </span>

          </p>

        </div>

        <div className="flex items-center gap-4">

          <button className="rounded-2xl bg-[#D6A35D] px-6 py-3 text-black transition hover:bg-[#e7b56f]">

            New Project

          </button>

          <button
            onClick={logout}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 transition hover:bg-white/[0.05]"
          >

            Logout

          </button>

        </div>

      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* LEFT */}
        <div className="col-span-8 space-y-6">

          {/* Welcome */}
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">

            <p className="text-sm uppercase tracking-[0.35em] text-[#D6A35D]">

              Welcome Back

            </p>

            <h2 className="mt-4 text-5xl font-semibold tracking-[-0.05em]">

              Your cinematic AI creator workspace

            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">

              Manage AI influencers, generate cinematic videos, train voice models and build high-end AI content workflows.

            </p>

          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-6">

            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#D6A35D]/30 hover:bg-white/[0.05]">

              <p className="text-sm uppercase tracking-[0.35em] text-[#D6A35D]">

                Face Lock

              </p>

              <h3 className="mt-4 text-3xl font-semibold">

                Generate consistent characters

              </h3>

            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#D6A35D]/30 hover:bg-white/[0.05]">

              <p className="text-sm uppercase tracking-[0.35em] text-[#D6A35D]">

                AI Videos

              </p>

              <h3 className="mt-4 text-3xl font-semibold">

                Create cinematic video scenes

              </h3>

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-6">

          {/* Stats */}
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">

            <h3 className="text-2xl font-semibold">

              Usage

            </h3>

            <div className="mt-6 space-y-5">

              <div className="flex items-center justify-between">

                <span className="text-zinc-500">
                  Characters
                </span>

                <span className="font-medium">
                  12
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-zinc-500">
                  Videos
                </span>

                <span className="font-medium">
                  48
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-zinc-500">
                  Voice Models
                </span>

                <span className="font-medium">
                  7
                </span>

              </div>

            </div>

          </div>

          {/* Recent */}
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">

            <h3 className="text-2xl font-semibold">

              Recent Activity

            </h3>

            <div className="mt-6 space-y-4">

              <div className="rounded-2xl bg-black/30 p-4 text-sm text-zinc-400">

                Generated cinematic AI video

              </div>

              <div className="rounded-2xl bg-black/30 p-4 text-sm text-zinc-400">

                Trained new AI voice model

              </div>

              <div className="rounded-2xl bg-black/30 p-4 text-sm text-zinc-400">

                Created consistent AI influencer

              </div>

            </div>

          </div>

        </div>

      </div>

    </motion.div>
  );
}