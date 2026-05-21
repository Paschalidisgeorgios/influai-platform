"use client";

import { motion } from "framer-motion";
import UploadCard from "@/app/components/UploadCard";

export default function FaceLockPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-10"
    >

      {/* Header */}
      <div className="mb-12 flex items-center justify-between">

        <div>

          <p className="text-sm uppercase tracking-[0.4em] text-[#D6A35D]">

            AI Character System

          </p>

          <h1 className="mt-3 text-6xl font-semibold tracking-[-0.05em]">

            Face Lock Studio

          </h1>

        </div>

        <button className="rounded-2xl bg-[#D6A35D] px-6 py-3 text-black transition hover:bg-[#e7b56f]">

          Generate Character

        </button>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">

        {/* LEFT */}
        <div className="col-span-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">

          <div className="mb-8">

            <h2 className="text-3xl font-semibold">

              Upload Training Images

            </h2>

            <p className="mt-3 text-zinc-500">

              Add multiple reference images to create a consistent AI identity.

            </p>

          </div>

          {/* Upload Grid */}
          <div className="grid grid-cols-3 gap-5">

            <UploadCard title="Front Face" />

            <UploadCard title="Side Profile" />

            <UploadCard title="Style Reference" />

          </div>

          {/* Prompt */}
          <div className="mt-8">

            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">

              Character Prompt

            </p>

            <textarea
              className="min-h-[180px] w-full rounded-3xl border border-white/10 bg-black/30 p-6 text-zinc-300 outline-none placeholder:text-zinc-600"
              placeholder="Hyper realistic luxury AI influencer with cinematic lighting, glossy skin, luxury fashion aesthetic and ultra detailed facial structure..."
            />

          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex items-center gap-4">

            <button className="rounded-2xl bg-[#D6A35D] px-6 py-4 text-black transition hover:bg-[#e7b56f]">

              Generate AI Character

            </button>

            <button className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-zinc-300 transition hover:bg-white/[0.05]">

              Save Preset

            </button>

          </div>

        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-6">

          {/* Settings */}
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">

            <h3 className="text-2xl font-semibold">

              Settings

            </h3>

            <div className="mt-6 space-y-5">

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                4K Ultra HD

              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                Cinematic Strong

              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                Maximum Lock

              </div>

            </div>

          </div>

          {/* Live Preview */}
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">

            <div className="mb-5 flex items-center justify-between">

              <h3 className="text-2xl font-semibold">

                Live Preview

              </h3>

              <div className="rounded-full bg-[#D6A35D]/10 px-3 py-1 text-xs text-[#D6A35D]">

                READY

              </div>

            </div>

            <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-zinc-800 to-black" />

            <button className="mt-6 w-full rounded-2xl bg-[#D6A35D] py-4 text-black transition hover:bg-[#e7b56f]">

              Train Character

            </button>

          </div>

        </div>

      </div>

    </motion.div>
  );
}