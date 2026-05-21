export default function AudioPage() {
    return (
      <div className="p-10">
  
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
  
          <div>
  
            <p className="text-sm uppercase tracking-[0.4em] text-[#D6A35D]">
  
              Neural Voice Engine
  
            </p>
  
            <h1 className="mt-3 text-6xl font-semibold tracking-[-0.05em]">
  
              AI Voice Clone
  
            </h1>
  
          </div>
  
          <button className="rounded-2xl bg-[#D6A35D] px-6 py-3 text-black transition hover:bg-[#e7b56f]">
  
            Train Voice
  
          </button>
  
        </div>
  
        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-8">
  
          {/* LEFT */}
          <div className="col-span-8 space-y-6">
  
            {/* Upload */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
  
              <div className="mb-8">
  
                <h2 className="text-3xl font-semibold">
  
                  Upload Voice Samples
  
                </h2>
  
                <p className="mt-3 text-zinc-500">
  
                  Upload clean speech recordings to train your AI voice model.
  
                </p>
  
              </div>
  
              <label className="group flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/30 transition hover:border-[#D6A35D]/40 hover:bg-[#D6A35D]/5">
  
                <div className="text-7xl text-zinc-700 transition group-hover:text-[#D6A35D]">
  
                  +
  
                </div>
  
                <p className="mt-5 text-lg text-zinc-500">
  
                  Upload Audio Files
  
                </p>
  
                <p className="mt-2 text-sm text-zinc-600">
  
                  MP3 / WAV / FLAC
  
                </p>
  
                <input type="file" className="hidden" />
  
              </label>
  
            </div>
  
            {/* Script */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
  
              <div className="mb-6">
  
                <h2 className="text-3xl font-semibold">
  
                  Voice Generation Script
  
                </h2>
  
                <p className="mt-3 text-zinc-500">
  
                  Enter the script your AI voice should speak.
  
                </p>
  
              </div>
  
              <textarea
                className="min-h-[220px] w-full rounded-3xl border border-white/10 bg-black/30 p-6 text-zinc-300 outline-none placeholder:text-zinc-600"
                placeholder="Welcome to the future of cinematic AI creator tools..."
              />
  
              <button className="mt-6 rounded-2xl bg-[#D6A35D] px-6 py-4 text-black transition hover:bg-[#e7b56f]">
  
                Generate Voice
  
              </button>
  
            </div>
  
          </div>
  
          {/* RIGHT */}
          <div className="col-span-4 space-y-6">
  
            {/* Settings */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
  
              <h2 className="text-2xl font-semibold">
  
                Voice Settings
  
              </h2>
  
              <div className="mt-6 space-y-5">
  
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
  
                  Cinematic Female
  
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
  
                  Confident Emotion
  
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
  
                  Studio Quality
  
                </div>
  
              </div>
  
            </div>
  
            {/* Voice Library */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
  
              <div className="mb-6 flex items-center justify-between">
  
                <h2 className="text-2xl font-semibold">
  
                  Voice Library
  
                </h2>
  
                <span className="text-sm text-zinc-500">
  
                  12 Voices
  
                </span>
  
              </div>
  
              <div className="space-y-4">
  
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
  
                  <div className="flex items-center justify-between">
  
                    <div>
  
                      <h3 className="font-medium">
  
                        Sophia AI
  
                      </h3>
  
                      <p className="mt-1 text-sm text-zinc-500">
  
                        Cinematic Female
  
                      </p>
  
                    </div>
  
                    <button className="rounded-full bg-[#D6A35D]/10 px-4 py-2 text-sm text-[#D6A35D]">
  
                      Play
  
                    </button>
  
                  </div>
  
                </div>
  
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
  
                  <div className="flex items-center justify-between">
  
                    <div>
  
                      <h3 className="font-medium">
  
                        Nova Voice
  
                      </h3>
  
                      <p className="mt-1 text-sm text-zinc-500">
  
                        Luxury Narration
  
                      </p>
  
                    </div>
  
                    <button className="rounded-full bg-[#D6A35D]/10 px-4 py-2 text-sm text-[#D6A35D]">
  
                      Play
  
                    </button>
  
                  </div>
  
                </div>
  
              </div>
  
            </div>
  
          </div>
  
        </div>
  
      </div>
    );
  }