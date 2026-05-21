export default function VideoPage() {
    return (
      <div className="p-10">
  
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
  
          <div>
  
            <p className="text-sm uppercase tracking-[0.4em] text-[#D6A35D]">
  
              Cinematic AI Engine
  
            </p>
  
            <h1 className="mt-3 text-6xl font-semibold tracking-[-0.05em]">
  
              AI Video Studio
  
            </h1>
  
          </div>
  
          <button className="rounded-2xl bg-[#D6A35D] px-6 py-3 text-black transition hover:bg-[#e7b56f]">
  
            Generate Video
  
          </button>
  
        </div>
  
        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-8">
  
          {/* LEFT */}
          <div className="col-span-8 space-y-6">
  
            {/* Prompt */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
  
              <div className="mb-6">
  
                <h2 className="text-3xl font-semibold">
  
                  Video Prompt
  
                </h2>
  
                <p className="mt-3 text-zinc-500">
  
                  Describe your cinematic AI scene in detail.
  
                </p>
  
              </div>
  
              <textarea
                className="min-h-[220px] w-full rounded-3xl border border-white/10 bg-black/30 p-6 text-zinc-300 outline-none placeholder:text-zinc-600"
                placeholder="Ultra cinematic close-up shot of luxury AI influencer walking through neon Tokyo streets..."
              />
  
              {/* Controls */}
              <div className="mt-6 grid grid-cols-3 gap-4">
  
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
  
                  <p className="mb-2 text-sm text-zinc-500">
  
                    Duration
  
                  </p>
  
                  <p className="text-lg">
  
                    10 Seconds
  
                  </p>
  
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
  
                  <p className="mb-2 text-sm text-zinc-500">
  
                    Resolution
  
                  </p>
  
                  <p className="text-lg">
  
                    4K Cinematic
  
                  </p>
  
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
  
                  <p className="mb-2 text-sm text-zinc-500">
  
                    Motion Style
  
                  </p>
  
                  <p className="text-lg">
  
                    Dynamic Camera
  
                  </p>
  
                </div>
  
              </div>
  
            </div>
  
            {/* Timeline */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
  
              <div className="mb-6 flex items-center justify-between">
  
                <h2 className="text-3xl font-semibold">
  
                  Scene Timeline
  
                </h2>
  
                <button className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-zinc-400 transition hover:bg-white/5">
  
                  Add Scene
  
                </button>
  
              </div>
  
              <div className="space-y-4">
  
                {/* Scene */}
                <div className="flex items-center gap-5 rounded-3xl border border-white/10 bg-black/30 p-5">
  
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D6A35D]/10 text-[#D6A35D]">
  
                    01
  
                  </div>
  
                  <div className="flex-1">
  
                    <h3 className="text-lg font-medium">
  
                      Opening Cinematic Shot
  
                    </h3>
  
                    <p className="mt-1 text-sm text-zinc-500">
  
                      Slow camera movement with dramatic lighting.
  
                    </p>
  
                  </div>
  
                  <div className="text-sm text-zinc-500">
  
                    0:00 - 0:04
  
                  </div>
  
                </div>
  
                {/* Scene */}
                <div className="flex items-center gap-5 rounded-3xl border border-white/10 bg-black/30 p-5">
  
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D6A35D]/10 text-[#D6A35D]">
  
                    02
  
                  </div>
  
                  <div className="flex-1">
  
                    <h3 className="text-lg font-medium">
  
                      Character Motion Scene
  
                    </h3>
  
                    <p className="mt-1 text-sm text-zinc-500">
  
                      AI influencer walking through environment.
  
                    </p>
  
                  </div>
  
                  <div className="text-sm text-zinc-500">
  
                    0:04 - 0:08
  
                  </div>
  
                </div>
  
              </div>
  
            </div>
  
          </div>
  
          {/* RIGHT */}
          <div className="col-span-4 space-y-6">
  
            {/* Preview */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
  
              <div className="mb-5 flex items-center justify-between">
  
                <h2 className="text-2xl font-semibold">
  
                  Live Preview
  
                </h2>
  
                <div className="rounded-full bg-[#D6A35D]/10 px-3 py-1 text-xs text-[#D6A35D]">
  
                  READY
  
                </div>
  
              </div>
  
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-zinc-800 to-black" />
  
              <button className="mt-6 w-full rounded-2xl bg-[#D6A35D] py-4 text-black">
  
                Render Video
  
              </button>
  
            </div>
  
            {/* Assets */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
  
              <h2 className="text-2xl font-semibold">
  
                Assets
  
              </h2>
  
              <div className="mt-6 space-y-4">
  
                <label className="flex cursor-pointer items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-zinc-500 transition hover:border-[#D6A35D]/40 hover:bg-[#D6A35D]/5">
  
                  Upload Character
  
                  <input type="file" className="hidden" />
  
                </label>
  
                <label className="flex cursor-pointer items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-zinc-500 transition hover:border-[#D6A35D]/40 hover:bg-[#D6A35D]/5">
  
                  Upload Environment
  
                  <input type="file" className="hidden" />
  
                </label>
  
                <label className="flex cursor-pointer items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-zinc-500 transition hover:border-[#D6A35D]/40 hover:bg-[#D6A35D]/5">
  
                  Upload Audio
  
                  <input type="file" className="hidden" />
  
                </label>
  
              </div>
  
            </div>
  
          </div>
  
        </div>
  
      </div>
    );
  }