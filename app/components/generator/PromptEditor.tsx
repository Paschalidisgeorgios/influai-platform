"use client";

import { Sparkles } from "lucide-react";

type Preset = {
  title: string;
  prompt: string;
};

type Props = {
  prompt: string;

  setPrompt: (
    value: string
  ) => void;

  presets: Preset[];

  loading: boolean;

  onGenerate: () => void;
};

export default function PromptEditor({
  prompt,
  setPrompt,
  presets,
  loading,
  onGenerate,
}: Props) {

  return (

    <div>

      {/* PRESETS */}

      <div className="mb-8">

        <label className="block text-sm text-gray-400 mb-4">
          Creative Presets
        </label>

        <div className="grid grid-cols-2 gap-3">

          {presets.map(
            (preset) => (

              <button
                key={preset.title}

                onClick={() =>
                  setPrompt(
                    preset.prompt
                  )
                }

                className="bg-black border border-[#1a1a1a] hover:border-[#c7a36a] transition rounded-2xl p-4 text-left"
              >

                <p className="font-semibold text-sm md:text-base">
                  {preset.title}
                </p>

              </button>

            )
          )}

        </div>

      </div>

      {/* PROMPT */}

      <div className="mb-8">

        <label className="block text-sm text-gray-400 mb-3">
          Base Prompt
        </label>

        <textarea
          value={prompt}

          onChange={(e) =>
            setPrompt(
              e.target.value
            )
          }

          placeholder="Describe the scene..."

          className="w-full h-40 bg-black border border-[#1a1a1a] rounded-2xl p-4 resize-none outline-none focus:border-[#c7a36a]"
        />

      </div>

      {/* GENERATE */}

      <button
        onClick={onGenerate}

        disabled={loading}

        className="w-full flex items-center justify-center gap-3 bg-[#c7a36a] text-black font-semibold py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-50"
      >

        <Sparkles size={18} />

        {loading
          ? "Generating..."
          : "Generate 4 Variations"}

      </button>

    </div>
  );
}