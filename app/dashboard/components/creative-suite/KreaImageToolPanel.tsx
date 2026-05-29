"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getDefaultModelIdForActiveTool,
  getModelOptionsForActiveTool,
} from "@/lib/ai/krea-model-ui";
import {
  ENHANCER_ENGINES,
  IMAGE_STUDIO_ENGINES,
  whiteLabelCardToModelOption,
} from "@/lib/dashboard/white-label-engines";
import { createClient } from "@/lib/supabase/client";
import { getMatrixEntry, type ActiveTool } from "@/lib/dashboard/creative-tool-matrix";
import { handleGenerateForTool } from "@/lib/dashboard/tool-generate";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import ToolWorkspace from "../studio/ToolWorkspace";

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
  product_photography: {
    en: "Professional product photography, commercial lighting, clean composition:",
    de: "Professionelle Produktfotografie, kommerzielles Licht, saubere Komposition:",
  },
};

const PRODUCT_STYLES = [
  { value: "ecommerce", labelEn: "Ecommerce", labelDe: "E-Commerce" },
  { value: "scene", labelEn: "Product Scene", labelDe: "Produkt-Szene" },
  { value: "luxury", labelEn: "Luxury Product", labelDe: "Luxury Product" },
  { value: "local", labelEn: "Local Business", labelDe: "Local Business" },
  { value: "social_ad", labelEn: "Social Ad", labelDe: "Social Ad" },
] as const;

export default function KreaImageToolPanel({ toolKey }: KreaImageToolPanelProps) {
  const tool = getMatrixEntry(toolKey);
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const { credits, onGenerationQueued, showStatus } = useCreativeSuite();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const getToken = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, [supabase.auth]);

  const {
    preview,
    setLoading: setPreviewLoading,
    setError: setPreviewError,
    clearPreviewError,
    pollGeneration,
  } = useWorkspaceGeneration(getToken);

  const [prompt, setPrompt] = useState("");
  const [material, setMaterial] = useState("");
  const [angle, setAngle] = useState("front");
  const [productStyle, setProductStyle] = useState("ecommerce");
  const [format, setFormat] = useState("square");
  const [selectedModel, setSelectedModel] = useState(() =>
    getDefaultModelIdForActiveTool(toolKey)
  );
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefix = toolKey ? PROMPT_PREFIX[toolKey] : undefined;
  const is3d = toolKey === "3d_objects";
  const isRealtime = toolKey === "realtime";
  const isEnhancer = toolKey === "enhancer";
  const isProduct = toolKey === "product_photography";
  const isImageStudio =
    toolKey === "image" || toolKey === "product_photography" || toolKey === "brand_assets";
  const requiresImage = toolKey === "edit" || toolKey === "enhancer";
  const showFormat = !isEnhancer && !is3d;
  const defaultEnhancePrompt =
    lang === "de"
      ? "Qualität verbessern, Schärfe erhöhen, sauberer Export."
      : "Enhance quality, increase sharpness, export-ready clarity.";

  const modelOptions = useMemo(() => {
    if (isEnhancer) {
      return ENHANCER_ENGINES.map((c) =>
        whiteLabelCardToModelOption(c, lang, tool?.creditCost)
      );
    }
    if (isImageStudio) {
      return IMAGE_STUDIO_ENGINES.map((c) =>
        whiteLabelCardToModelOption(c, lang, tool?.creditCost)
      );
    }
    return getModelOptionsForActiveTool(toolKey).map((m) => ({
      ...m,
      credits: tool?.creditCost,
    }));
  }, [toolKey, lang, tool?.creditCost, isEnhancer, isImageStudio]);

  useEffect(() => {
    if (isEnhancer) {
      setSelectedModel(ENHANCER_ENGINES[0]!.id);
    } else if (isImageStudio) {
      setSelectedModel(IMAGE_STUDIO_ENGINES[0]!.id);
    } else {
      setSelectedModel(getDefaultModelIdForActiveTool(toolKey));
    }
  }, [toolKey, isEnhancer, isImageStudio]);

  const uploadReferenceImage = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      setSourcePreviewUrl(URL.createObjectURL(file));
      try {
        const token = await getToken();
        if (!token) throw new Error("Session expired");

        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/reference-sources/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.imageUrl) throw new Error(data.error || "Upload failed");
        setSourceImageUrl(data.imageUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [getToken]
  );

  const buildPrompt = useCallback(() => {
    const p = prompt.trim();
    const effectivePrompt = isEnhancer && !p ? defaultEnhancePrompt : p;
    const pre = lang === "de" ? prefix?.de : prefix?.en;
    const parts = [pre, effectivePrompt].filter(Boolean);

    if (isProduct) {
      const styleLabel = PRODUCT_STYLES.find((s) => s.value === productStyle);
      parts.push(
        lang === "de"
          ? `Stil: ${styleLabel?.labelDe ?? productStyle}.`
          : `Style: ${styleLabel?.labelEn ?? productStyle}.`
      );
    }

    if (is3d && material.trim()) {
      parts.push(
        lang === "de"
          ? `Material: ${material.trim()}. Winkel: ${angle}.`
          : `Material: ${material.trim()}. Angle: ${angle}.`
      );
    }
    return parts.join(" ");
  }, [
    prompt,
    prefix,
    lang,
    is3d,
    material,
    angle,
    isEnhancer,
    isProduct,
    productStyle,
    defaultEnhancePrompt,
  ]);

  const hasPrompt = prompt.trim().length > 0;
  const canGenerate =
    !loading &&
    !uploading &&
    credits >= (tool?.creditCost ?? 0) &&
    (isEnhancer
      ? !!sourceImageUrl
      : requiresImage
        ? !!sourceImageUrl && hasPrompt
        : hasPrompt);

  const handleGenerate = async () => {
    if (!canGenerate || !tool) return;
    setLoading(true);
    setError(null);
    clearPreviewError();
    setPreviewLoading(
      lang === "de" ? "Generierung läuft …" : "Generation in progress …"
    );

    try {
      const token = await getToken();
      if (!token) {
        const msg = lang === "de" ? "Sitzung abgelaufen." : "Session expired.";
        setError(msg);
        setPreviewError(msg);
        return;
      }

      const result = await handleGenerateForTool({
        toolKey,
        token,
        prompt: buildPrompt(),
        outputFormat: format,
        kreaModelId: selectedModel,
        sourceImageUrl: requiresImage ? sourceImageUrl ?? undefined : undefined,
        editInstruction: toolKey === "edit" ? buildPrompt() : undefined,
      });

      if (!result.success) {
        setError(result.error);
        setPreviewError(result.error);
        return;
      }

      if (result.generationId) {
        showStatus(
          lang === "de" ? "Generierung gestartet." : "Generation started."
        );
        onGenerationQueued();
        pollGeneration(result.generationId, lang);
      }
    } catch {
      const msg =
        lang === "de" ? "Generierung fehlgeschlagen." : "Generation failed.";
      setError(msg);
      setPreviewError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!tool) return null;

  const idleLabel =
    lang === "de"
      ? "Dein Ergebnis erscheint hier."
      : "Your result will appear here.";

  return (
    <ToolWorkspace
      embedded
      title={lang === "de" ? tool.titleDe : tool.titleEn}
      subtitle={lang === "de" ? tool.subtitleDe : tool.subtitleEn}
      modelOptions={modelOptions}
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}
      promptText={prompt}
      onPromptChange={setPrompt}
      selectedFormat={showFormat ? format : undefined}
      onFormatChange={showFormat ? setFormat : undefined}
      badges={tool.commandBarBadges}
      creditCost={tool.creditCost}
      availableCredits={credits}
      onGenerate={handleGenerate}
      generateDisabled={!canGenerate}
      loading={loading}
      promptOptional={isEnhancer}
      previewState={preview}
      idlePreviewLabel={idleLabel}
      modelGridColumns={isEnhancer ? 1 : isImageStudio ? 4 : undefined}
      formatVariant={toolKey === "image" ? "popover" : "social"}
      modelLabelEn="Engine"
      modelLabelDe="Engine"
      generateLabel={lang === "de" ? "Generieren" : "Generate"}
      promptPlaceholder={
        isEnhancer
          ? lang === "de"
            ? "Optional: z.B. Haut retuschieren, Hintergrund schärfen…"
            : "Optional: e.g. skin retouch, sharpen background…"
          : isProduct
            ? lang === "de"
              ? "Produktbeschreibung, z.B. Sneaker auf weißem Hintergrund…"
              : "Product description, e.g. sneaker on white background…"
            : is3d
              ? lang === "de"
                ? "z.B. Sneaker auf Marmorsockel"
                : "e.g. Sneaker on marble pedestal"
              : lang === "de"
                ? "Beschreibe dein nächstes Visual…"
                : "Describe your next visual…"
      }
    >
      {requiresImage ? (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {isEnhancer
              ? lang === "de"
                ? "Medien"
                : "Media"
              : lang === "de"
                ? "Referenzbild"
                : "Source image"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadReferenceImage(file);
              e.target.value = "";
            }}
          />
          {sourcePreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sourcePreviewUrl}
              alt=""
              className="h-52 w-full rounded-xl border border-gray-200 object-contain bg-gray-50"
            />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`flex w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-gray-300 ${
                isEnhancer ? "min-h-[200px] p-8" : "h-40 border-dashed"
              }`}
            >
              {isEnhancer
                ? lang === "de"
                  ? "Medien hochladen"
                  : "Upload Media"
                : `+ ${lang === "de" ? "Bild hochladen" : "Upload image"}`}
            </button>
          )}
        </div>
      ) : null}

      {isProduct ? (
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {lang === "de" ? "Produkt-Stil" : "Product style"}
          </span>
          <select
            value={productStyle}
            onChange={(e) => setProductStyle(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
          >
            {PRODUCT_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {lang === "de" ? s.labelDe : s.labelEn}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {is3d ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Material
            </span>
            <input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
              placeholder="matte plastic, brushed metal…"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {lang === "de" ? "Winkel" : "Angle"}
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

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </ToolWorkspace>
  );
}
