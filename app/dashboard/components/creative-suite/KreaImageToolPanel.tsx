"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMatrixEntry, type ActiveTool } from "@/lib/dashboard/creative-tool-matrix";
import { handleGenerateForTool } from "@/lib/dashboard/tool-generate";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import CreativeToolResult from "./CreativeToolResult";

type KreaImageToolPanelProps = {
  toolKey: ActiveTool;
};

const PROMPT_PREFIX: Partial<Record<NonNullable<ActiveTool>, { en: string; de: string }>> = {
  realtime: {
    en: "Fast creative draft, campaign-ready:",
    de: "Schneller Kreativ-Draft, kampagnenfähig:",
  },
  "3d_objects": {
    en: "Photorealistic 3D product render, studio lighting, textured materials:",
    de: "Fotorealistisches 3D-Produktrender, Studiolicht, textureierte Materialien:",
  },
};

export default function KreaImageToolPanel({ toolKey }: KreaImageToolPanelProps) {
  const tool = getMatrixEntry(toolKey);
  const { language } = useDashboardLanguage();
  const { credits, onGenerationQueued, showStatus } = useCreativeSuite();
  const supabase = createClient();

  const [prompt, setPrompt] = useState("");
  const [material, setMaterial] = useState("");
  const [angle, setAngle] = useState("front");
  const [format, setFormat] = useState("square");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const prefix = toolKey ? PROMPT_PREFIX[toolKey] : undefined;
  const is3d = toolKey === "3d_objects";
  const isRealtime = toolKey === "realtime";

  const buildPrompt = useCallback(() => {
    const p = prompt.trim();
    const pre = language === "de" ? prefix?.de : prefix?.en;
    const parts = [pre, p].filter(Boolean);
    if (is3d && material.trim()) {
      parts.push(
        language === "de"
          ? `Material: ${material.trim()}. Winkel: ${angle}.`
          : `Material: ${material.trim()}. Angle: ${angle}.`
      );
    }
    return parts.join(" ");
  }, [prompt, prefix, language, is3d, material, angle]);

  const canGenerate = prompt.trim().length > 0 && !loading;

  const handleGenerate = async () => {
    if (!canGenerate || !tool) return;
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("Session expired.");
        return;
      }

      const result = await handleGenerateForTool({
        toolKey,
        token,
        prompt: buildPrompt(),
        outputFormat: format,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (isRealtime && result.generationId) {
        showStatus(
          language === "de"
            ? "Draft in Warteschlange — siehe Assets."
            : "Draft queued — check Assets."
        );
        onGenerationQueued();
        return;
      }

      if (result.generationId) {
        showStatus(
          language === "de" ? "Generierung gestartet." : "Generation started."
        );
        onGenerationQueued();
      }
    } catch {
      setError("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreview = () => {
    if (!prompt.trim()) return;
    const label = buildPrompt().slice(0, 80);
    setPreviews((prev) => [label, ...prev].slice(0, 4));
  };

  if (!tool) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <label className="block">
          <span className="text-xs font-bold text-slate-500">
            {language === "de" ? "Prompt" : "Prompt"}
          </span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            placeholder={
              is3d
                ? language === "de"
                  ? "z.B. Sneaker auf Marmorsockel"
                  : "e.g. Sneaker on marble pedestal"
                : language === "de"
                  ? "Beschreibe dein nächstes Visual…"
                  : "Describe your next visual…"
            }
          />
        </label>

        {is3d ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold text-slate-500">
                {language === "de" ? "Material" : "Material"}
              </span>
              <input
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
                placeholder="matte plastic, brushed metal…"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">
                {language === "de" ? "Winkel" : "Angle"}
              </span>
              <select
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
              >
                <option value="front">Front</option>
                <option value="3/4">3/4</option>
                <option value="top">Top</option>
                <option value="hero">Hero</option>
              </select>
            </label>
          </div>
        ) : null}

        <label className="block">
          <span className="text-xs font-bold text-slate-500">Format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
          >
            <option value="square">1:1</option>
            <option value="tiktok">9:16</option>
            <option value="youtube_thumbnail">16:9</option>
            <option value="instagram_post">4:5</option>
          </select>
        </label>
      </div>

      {isRealtime ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            {language === "de" ? "Schnelle Previews" : "Quick previews"}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {previews.length === 0 ? (
              <p className="col-span-2 text-xs text-slate-500">
                {language === "de"
                  ? "Prompt eingeben und „Preview notieren“ für eine Draft-Liste."
                  : "Enter a prompt and note a preview for your draft list."}
              </p>
            ) : (
              previews.map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-slate-700"
                >
                  {p}
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={handleQuickPreview}
            disabled={!prompt.trim()}
            className="mt-3 rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-gray-200 disabled:opacity-40"
          >
            {language === "de" ? "Preview notieren" : "Note preview"}
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canGenerate}
          onClick={handleGenerate}
          className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-40"
        >
          {loading
            ? language === "de"
              ? "Wird erstellt…"
              : "Generating…"
            : language === "de"
              ? "Generieren"
              : "Generate"}
        </button>
        <span className="text-xs font-bold text-orange-600">
          {tool.creditCost} {language === "de" ? "Credits" : "Credits"}
        </span>
        <span className="text-xs text-slate-500">{credits} available</span>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <CreativeToolResult
          imageUrl={resultUrl}
          emptyLabel={
            language === "de"
              ? "Ergebnis erscheint in Assets nach der Generierung."
              : "Result appears in Assets after generation."
          }
        />
      </div>
    </div>
  );
}
