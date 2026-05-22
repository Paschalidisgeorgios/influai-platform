"use client";

import {
  Sparkles,
  Brain,
  ImageIcon,
  Wand2,
} from "lucide-react";

export default function EmptyState() {

  return (

    <div className="border border-dashed border-[#1a1a1a] rounded-3xl p-10">

      {/* HEADER */}

      <div className="text-center mb-10">

        <div className="w-20 h-20 rounded-3xl bg-[#1a140d] flex items-center justify-center mx-auto mb-6">

          <Sparkles
            className="text-[#c7a36a]"
            size={34}
          />

        </div>

        <h3 className="text-3xl font-bold mb-4">
          Cinematic AI Engine
        </h3>

        <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
          Enter a prompt, optionally select a character, and generate four FLUX variations. Results appear here instantly.
        </p>

      </div>

      {/* FEATURES */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5">

          <Brain
            className="text-[#c7a36a] mb-4"
            size={24}
          />

          <h4 className="font-semibold mb-2">
            Character Memory
          </h4>

          <p className="text-sm text-gray-400 leading-relaxed">
            AI learns visual identity, style memory and cinematic consistency over time.
          </p>

        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5">

          <Wand2
            className="text-[#c7a36a] mb-4"
            size={24}
          />

          <h4 className="font-semibold mb-2">
            Prompt Intelligence
          </h4>

          <p className="text-sm text-gray-400 leading-relaxed">
            OpenAI enhances prompts when available, with automatic fallback to your consistency prompt.
          </p>

        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5">

          <ImageIcon
            className="text-[#c7a36a] mb-4"
            size={24}
          />

          <h4 className="font-semibold mb-2">
            Consistency Engine
          </h4>

          <p className="text-sm text-gray-400 leading-relaxed">
            Maintain persistent character identity across multiple generations.
          </p>

        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5">

          <Sparkles
            className="text-[#c7a36a] mb-4"
            size={24}
          />

          <h4 className="font-semibold mb-2">
            Cinematic Rendering
          </h4>

          <p className="text-sm text-gray-400 leading-relaxed">
            Generate luxury editorial visuals optimized for creators and influencers.
          </p>

        </div>

      </div>

      {/* FOOTER */}

      <div className="text-center">

        <p className="text-sm uppercase tracking-[0.3em] text-[#c7a36a]">
          Ready for generation
        </p>

      </div>

    </div>
  );
}