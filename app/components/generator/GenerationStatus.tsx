"use client";

type Props = {
  step: string;
};

export default function GenerationStatus({
  step,
}: Props) {

  return (

    <div className="bg-black border border-[#1a1a1a] rounded-3xl p-5 md:p-8 mb-8">

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

        <h3 className="text-xl md:text-2xl font-bold">
          AI Generation Engine
        </h3>

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-[#c7a36a] animate-pulse" />

          <span className="text-[#c7a36a] text-sm uppercase tracking-[0.2em]">
            Running
          </span>

        </div>

      </div>

      {/* STEP */}

      <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-6 mb-6">

        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-3">
          Current Step
        </p>

        <p className="text-lg md:text-xl text-white font-semibold">
          {step || "Preparing..."}
        </p>

      </div>

      {/* AI PROCESS */}

      <div className="space-y-4">

        <div className="flex items-center gap-4 text-sm text-gray-400">

          <div className="w-2 h-2 rounded-full bg-[#c7a36a]" />

          Character DNA analysis

        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">

          <div className="w-2 h-2 rounded-full bg-[#c7a36a]" />

          Cinematic prompt enhancement

        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">

          <div className="w-2 h-2 rounded-full bg-[#c7a36a]" />

          Consistency engine active

        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">

          <div className="w-2 h-2 rounded-full bg-[#c7a36a]" />

          Rendering cinematic frames

        </div>

      </div>

    </div>
  );
}