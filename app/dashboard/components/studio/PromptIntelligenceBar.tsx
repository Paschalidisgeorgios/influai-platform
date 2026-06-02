"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, TrendingUp, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import type { EnhancedPromptResult, ViralScore } from "@/lib/ai/smartPromptEngine";

type PromptIntelligenceBarProps = {
  prompt: string;
  imageMode: string;
  platform: string;
  onUseEnhanced: (enhancedPrompt: string) => void;
  onAutoMode: (mode: string) => void;
  language: "en" | "de";
};

type AnalyzeResponse = EnhancedPromptResult & { viralScore: ViralScore };

export default function PromptIntelligenceBar({
  prompt,
  imageMode,
  platform,
  onUseEnhanced,
  onAutoMode,
  language,
}: PromptIntelligenceBarProps) {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const onAutoModeRef = useRef(onAutoMode);
  const lastAutoModeRef = useRef<string | null>(null);

  useEffect(() => {
    onAutoModeRef.current = onAutoMode;
  }, [onAutoMode]);

  useEffect(() => {
    if (!prompt.trim() || prompt.trim().length < 3) {
      setResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/prompt/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, imageMode, platform }),
        });
        if (res.ok) {
          const data = (await res.json()) as AnalyzeResponse;
          setResult(data);
          if (
            data.autoSelectedMode &&
            data.autoSelectedMode !== imageMode &&
            data.autoSelectedMode !== lastAutoModeRef.current
          ) {
            lastAutoModeRef.current = data.autoSelectedMode;
            onAutoModeRef.current(data.autoSelectedMode);
          }
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [prompt, imageMode, platform]);

  if (!result && !loading) return null;

  const scoreColor = result
    ? result.viralScore.score >= 8
      ? "text-green-400"
      : result.viralScore.score >= 6
        ? "text-[#d8ad5f]"
        : "text-white/50"
    : "";

  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-black/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#d8ad5f]" />
          <span className="text-xs font-semibold text-white/70">
            {loading
              ? language === "de"
                ? "Analysiere…"
                : "Analyzing…"
              : language === "de"
                ? "Prompt Intelligence"
                : "Prompt Intelligence"}
          </span>
          {result ? (
            <span className={`text-xs font-bold ${scoreColor}`}>
              {result.viralScore.score}/10 {result.viralScore.label}
            </span>
          ) : null}
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-white/40" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-white/40" />
        )}
      </button>

      {expanded && result ? (
        <div className="px-3 pb-3 space-y-2 border-t border-white/10 pt-2">
          {result.analysis.autoEnhanced ? (
            <div className="flex items-start gap-2">
              <Wand2 className="h-3.5 w-3.5 text-[#d8ad5f] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/40 mb-1">
                  {language === "de" ? "Verbesserter Prompt:" : "Enhanced prompt:"}
                </p>
                <p className="text-xs text-white/70 line-clamp-2">
                  {result.enhancedPrompt}
                </p>
                <button
                  type="button"
                  onClick={() => onUseEnhanced(result.enhancedPrompt)}
                  className="mt-1.5 text-[11px] font-bold text-[#d8ad5f] hover:text-[#efc777]"
                >
                  {language === "de"
                    ? "Verbesserten Prompt nutzen →"
                    : "Use enhanced prompt →"}
                </button>
              </div>
            </div>
          ) : null}
          {result.viralScore.tips.length > 0 ? (
            <div className="flex items-start gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
              <div>
                {result.viralScore.tips.map((tip, i) => (
                  <p key={i} className="text-[11px] text-white/50">
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
