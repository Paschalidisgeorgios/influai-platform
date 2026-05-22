"use client";

type Props = {
  originalPrompt: string;

  enhancedPrompt: string;

  hasCharacter: boolean;
};

export default function PromptInsights({
  originalPrompt,
  enhancedPrompt,
  hasCharacter,
}: Props) {

  return (

    <div className="bg-black border border-[#1a1a1a] rounded-3xl p-6 mb-8">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <h3 className="text-xl font-bold">
          AI Prompt Intelligence
        </h3>

        <div className="bg-[#1a140d] text-[#c7a36a] text-xs px-3 py-2 rounded-full">
          ACTIVE
        </div>

      </div>

      {/* ORIGINAL */}

      <div className="mb-6">

        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-3">
          Original Prompt
        </p>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4 text-gray-300 leading-relaxed">
          {originalPrompt}
        </div>

      </div>

      {/* ENHANCED */}

      <div className="mb-6">

        <p className="text-sm uppercase tracking-[0.2em] text-[#c7a36a] mb-3">
          AI Enhanced Prompt
        </p>

        <div className="bg-[#080808] border border-[#c7a36a]/20 rounded-2xl p-4 text-white leading-relaxed whitespace-pre-wrap">
          {enhancedPrompt}
        </div>

      </div>

      {/* AI STATUS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
            Prompt AI
          </p>

          <p className="text-[#c7a36a] font-semibold">
            Enhanced
          </p>

        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
            Character Memory
          </p>

          <p className="text-[#c7a36a] font-semibold">
            {hasCharacter
              ? "Active"
              : "Inactive"}
          </p>

        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
            Consistency Engine
          </p>

          <p className="text-[#c7a36a] font-semibold">
            Running
          </p>

        </div>

      </div>

    </div>
  );
}