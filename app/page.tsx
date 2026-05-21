"use client";

import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0D0D0F] text-white">

      {/* Background */}
      <div className="absolute inset-0">

        <img
          src="/images/hero.jpg"
          alt="AI Influencer"
          className="h-full w-full object-cover object-[78%_15%]"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/90 via-35% to-transparent" />

      </div>

      {/* Navbar */}
      <header className="relative z-50 flex justify-center pt-5">

        <nav className="flex w-[92%] max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/20 px-8 py-4 backdrop-blur-xl">

          <div className="text-[26px] font-semibold tracking-[0.32em]">
          INFLUAI
          </div>

          <div className="hidden items-center gap-12 text-sm text-zinc-300 md:flex">

            <a href="#">Product</a>
            <a href="#">Tools</a>
            <a href="#">Pricing</a>
            <a href="#">Creators</a>

          </div>

          <div className="flex items-center gap-5">

            <button className="text-sm text-zinc-300">
              Sign in
            </button>

            <button className="rounded-full bg-[#D6A35D] px-7 py-3 text-sm font-medium text-black">
              Open App
            </button>

          </div>

        </nav>

      </header>

      {/* Hero */}
      <section className="relative z-40 flex min-h-screen items-center">

        <div className="mx-auto flex w-full max-w-7xl px-8">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1 }}
            className="max-w-2xl pb-16"
          >

            <p className="mb-8 text-sm uppercase tracking-[0.42em] text-[#D6A35D]">
              Cinematic AI Photoshoot
            </p>

            <h1 className="max-w-[760px] text-[92px] font-semibold leading-[0.95] tracking-[-0.06em]">

              Create your AI influencer in{" "}

              <span className="text-[#D6A35D]">
                seconds
              </span>

            </h1>

            <p className="mt-10 max-w-xl text-[22px] leading-relaxed text-zinc-300">

              Hyper-realistic virtual influencers and cinematic visuals crafted with next-generation creative intelligence.

            </p>

            <div className="mt-12 flex items-center gap-5">

              <button className="rounded-full bg-[#D6A35D] px-9 py-5 text-[15px] font-medium text-black">

                Start Creating →

              </button>

              <button className="flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-8 py-5 text-[15px] text-white backdrop-blur-md">

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20">

                  ▶

                </div>

                Watch Demo

              </button>

            </div>

            <div className="mt-24">

              <p className="mb-6 text-xs uppercase tracking-[0.4em] text-zinc-500">

                Trusted by creators worldwide

              </p>

              <div className="flex items-center gap-12 text-[30px] text-zinc-500">

                <span>Stripe</span>
                <span>Vercel</span>
                <span>Linear</span>
                <span>Notion</span>
                <span>Figma</span>

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* Features */}
      <section className="relative z-30 border-t border-white/5 bg-[#0D0D0F] py-32">

        <div className="mx-auto max-w-7xl px-8">

          <div className="mb-20 max-w-3xl">

            <p className="mb-6 text-sm uppercase tracking-[0.4em] text-[#D6A35D]">
              AI Creator Studio
            </p>

            <h2 className="text-6xl font-semibold leading-[1] tracking-[-0.05em]">

              Everything you need to create cinematic AI content

            </h2>

          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            {/* Card 1 */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl">

              <div className="mb-8 inline-flex rounded-full bg-[#D6A35D]/10 px-4 py-2 text-sm text-[#D6A35D]">

                Face Lock Technology

              </div>

              <h3 className="text-4xl font-semibold tracking-[-0.04em]">

                Generate consistent AI characters

              </h3>

              <p className="mt-6 text-lg leading-relaxed text-zinc-400">

                Upload reference images and maintain perfect facial consistency across every scene.

              </p>

            </div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl"
            >

              <div className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-[#D6A35D]/10 blur-[100px]" />

              <div className="relative z-10">

                <div className="mb-8 inline-flex rounded-full bg-[#D6A35D]/10 px-4 py-2 text-sm text-[#D6A35D]">

                  AI Video Generation

                </div>

                <h3 className="text-4xl font-semibold tracking-[-0.04em]">

                  Cinematic AI dashboard experience

                </h3>

                <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">

                  Generate AI videos, maintain character consistency and manage cinematic creator workflows.

                </p>

                <div className="mt-12 rounded-[28px] border border-white/10 bg-black/40 p-6 shadow-[0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">

                  <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">

                    <div>

                      <h4 className="text-lg font-medium text-white">
                        AI Creator Dashboard
                      </h4>

                      <p className="text-sm text-zinc-500">
                        Face Lock • Video • Audio Clone
                      </p>

                    </div>

                    <div className="rounded-full bg-[#D6A35D]/10 px-4 py-2 text-xs text-[#D6A35D]">
                      LIVE
                    </div>

                  </div>

                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">

                    <p className="text-sm text-zinc-500">
                      Upload reference images
                    </p>

                    <div className="mt-4 flex justify-center gap-3">

                      <div className="h-16 w-16 rounded-2xl bg-zinc-800" />
                      <div className="h-16 w-16 rounded-2xl bg-zinc-700" />
                      <div className="h-16 w-16 rounded-2xl bg-zinc-800" />

                    </div>

                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">

                    <p className="mb-3 text-sm text-zinc-500">
                      Video Prompt
                    </p>

                    <div className="rounded-xl bg-black/40 p-4 text-sm text-zinc-400">

                      Cinematic close-up shot of AI influencer walking through neon Tokyo streets at night...

                    </div>

                  </div>

                  <button className="mt-6 w-full rounded-2xl bg-[#D6A35D] py-4 text-sm font-medium text-black transition hover:bg-[#e7b56f]">

                    Generate Cinematic Video

                  </button>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

    </main>
  );
}