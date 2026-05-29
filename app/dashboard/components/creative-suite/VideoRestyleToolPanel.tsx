"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { handleGenerateForTool } from "@/lib/dashboard/tool-generate";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import CreativeToolResult from "./CreativeToolResult";

export default function VideoRestyleToolPanel() {
  const { language } = useDashboardLanguage();
  const { credits, onGenerationQueued } = useCreativeSuite();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [stylePrompt, setStylePrompt] = useState("");
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      const blob = URL.createObjectURL(file);
      setPreviewUrl(blob);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Session expired");

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/reference-sources/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.imageUrl) {
          throw new Error(data.error || "Upload failed");
        }
        setSourceImageUrl(data.imageUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [supabase.auth]
  );

  const canGenerate =
    !!sourceImageUrl &&
    stylePrompt.trim().length > 0 &&
    !uploading &&
    !loading;

  const handleGenerate = async () => {
    if (!canGenerate || !sourceImageUrl) return;
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

      const editInstruction = `Restyle this campaign visual: ${stylePrompt.trim()}. Premium video restyle look, cinematic color grade, maintain subject.`;

      const result = await handleGenerateForTool({
        toolKey: "video_restyle",
        token,
        sourceImageUrl,
        editInstruction,
        outputFormat: "square",
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onGenerationQueued();
      setResultImageUrl(null);
    } catch {
      setError("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-xs font-medium text-slate-600">
        {language === "de"
          ? "Lade ein Referenzbild oder Frame hoch und beschreibe den gewünschten Video-Restyle. Die Vorschau nutzt die Bild-Pipeline; volles Video-Restyle folgt."
          : "Upload a reference frame and describe the video restyle. Preview uses the image pipeline; full video restyle follows."}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-slate-900">
            {language === "de" ? "Referenz / Frame" : "Reference / frame"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadImage(f);
              e.target.value = "";
            }}
          />
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-48 w-full rounded-xl object-contain bg-black" />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-slate-500"
            >
              + {language === "de" ? "Bild hochladen" : "Upload image"}
            </button>
          )}
          {uploading ? (
            <p className="mt-2 text-xs text-slate-500">
              {language === "de" ? "Wird hochgeladen…" : "Uploading…"}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="block">
            <span className="text-sm font-bold text-slate-900">
              {language === "de" ? "Restyle-Prompt" : "Restyle prompt"}
            </span>
            <textarea
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              rows={6}
              className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900"
              placeholder={
                language === "de"
                  ? "z.B. cinematic teal-orange, luxury brand, high contrast"
                  : "e.g. cinematic teal-orange, luxury brand, high contrast"
              }
            />
          </label>
        </div>
      </div>

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
              ? "Restyle-Vorschau erstellen"
              : "Create restyle preview"}
        </button>
        <span className="text-xs font-bold text-orange-600">5 Credits</span>
        <span className="text-xs text-slate-500">{credits} available</span>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <CreativeToolResult
          imageUrl={resultImageUrl}
          emptyLabel={
            language === "de"
              ? "Vorschau in Assets nach Generierung."
              : "Preview in Assets after generation."
          }
        />
      </div>
    </div>
  );
}
