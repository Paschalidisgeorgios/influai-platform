"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, Layers3, Loader2 } from "lucide-react";
import type { GalleryAssetRow } from "@/app/components/gallery/GalleryAssetCard";
import {
  buildExportPackManifest,
  downloadExportAsset,
  formatExportPackForClipboard,
  getExportPackUiCopy,
  type ExportPackAssetRef,
  type ExportPackManifest,
} from "@/app/lib/export/export-pack";
import { sanitizeUserFacingApiError } from "@/lib/env/user-facing-errors";

type Props = {
  prompt: string;
  language?: "en" | "de";
  disabled?: boolean;
  getAccessToken: () => Promise<string | null>;
  showHeader?: boolean;
  className?: string;
  panelId?: string;
};

function CopyButton({
  text,
  label,
  isDe,
}: {
  text: string;
  label: string;
  isDe: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      disabled={!text.trim()}
      aria-label={label}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.1] bg-[#070A12]/80 px-2 py-1 text-[11px] font-semibold text-neutral-400 transition hover:border-amber-500/35 hover:text-amber-300 disabled:opacity-40"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" aria-hidden />
      ) : (
        <Copy className="h-3 w-3" aria-hidden />
      )}
      {copied ? (isDe ? "Kopiert" : "Copied") : isDe ? "Kopieren" : "Copy"}
    </button>
  );
}

function rowToExportRef(row: GalleryAssetRow): ExportPackAssetRef | null {
  const url = row.video_url ?? row.image_url ?? null;
  if (!url) return null;
  return {
    id: row.id,
    url,
    outputType: row.video_url ? "video" : "image",
    prompt: row.prompt,
    createdAt: row.created_at,
  };
}

export default function ExportPackPanel({
  prompt,
  language = "en",
  disabled = false,
  getAccessToken,
  showHeader = true,
  className = "",
  panelId = "export-pack-panel",
}: Props) {
  const lang = language === "de" ? "de" : "en";
  const isDe = lang === "de";
  const copy = getExportPackUiCopy(lang);

  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ExportPackManifest | null>(null);
  const [galleryAssets, setGalleryAssets] = useState<ExportPackAssetRef[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadAssets() {
      setAssetsLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          if (!cancelled) setGalleryAssets([]);
          return;
        }

        const res = await fetch("/api/generations?limit=12&status=completed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as {
          generations?: GalleryAssetRow[];
          error?: string;
        };

        if (!res.ok || !Array.isArray(data.generations)) {
          if (!cancelled) setGalleryAssets([]);
          return;
        }

        const refs = data.generations
          .map(rowToExportRef)
          .filter((ref): ref is ExportPackAssetRef => ref != null);

        if (!cancelled) {
          setGalleryAssets(refs);
          setSelectedIds(new Set(refs.slice(0, 3).map((ref) => ref.id)));
        }
      } catch {
        if (!cancelled) setGalleryAssets([]);
      } finally {
        if (!cancelled) setAssetsLoading(false);
      }
    }

    void loadAssets();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken]);

  const selectedAssets = useMemo(
    () => galleryAssets.filter((asset) => selectedIds.has(asset.id)),
    [galleryAssets, selectedIds]
  );

  const canPrepare =
    !disabled &&
    !loading &&
    (prompt.trim().length >= 3 ||
      selectedAssets.some((asset) => asset.prompt?.trim()));

  function toggleAsset(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runPrepare() {
    if (!canPrepare) return;
    setLoading(true);
    setError(null);

    const assetPrompts = selectedAssets
      .map((asset) => asset.prompt?.trim())
      .filter((p): p is string => Boolean(p));

    try {
      const res = await fetch("/api/export-pack/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          language: lang,
          assetPrompts,
        }),
      });
      const data = (await res.json()) as ExportPackManifest & { error?: string };

      if (!res.ok || data.error) {
        setManifest(
          buildExportPackManifest({
            prompt: prompt.trim(),
            language: lang,
            assetPrompts,
            selectedAssets,
          })
        );
        if (data.error) {
          setError(
            sanitizeUserFacingApiError(data.error, copy.errorGeneric, lang)
          );
        }
        return;
      }

      setManifest({ ...data, selectedAssets });
    } catch {
      setManifest(
        buildExportPackManifest({
          prompt: prompt.trim(),
          language: lang,
          assetPrompts,
          selectedAssets,
        })
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadSelected() {
    for (const asset of selectedAssets) {
      downloadExportAsset(asset.url);
    }
  }

  const manifestCopyText = manifest
    ? formatExportPackForClipboard(manifest, lang)
    : "";
  const captionsCopyText = manifest ? manifest.captions.join("\n\n") : "";
  const hashtagsCopyText = manifest ? manifest.hashtags.join(" ") : "";

  return (
    <section
      id={panelId}
      className={`rounded-2xl border border-white/[0.08] bg-[#111827]/50 p-4 sm:p-5 ${className}`}
      aria-labelledby={showHeader ? "export-pack-title" : undefined}
    >
      {showHeader ? (
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-400">
            <Layers3 className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                id="export-pack-title"
                className="text-sm font-semibold text-[#F9FAFB]"
              >
                {copy.title}
              </h3>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                {copy.freeExportBadge}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#9CA3AF]">
              {copy.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-[#0E1220]/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#F9FAFB]">{copy.title}</p>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
              {copy.freeExportBadge}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
            {copy.description}
          </p>
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
        {copy.costNote}
      </p>

      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          {copy.selectAssets}
        </p>
        {assetsLoading ? (
          <p className="mt-2 text-xs text-neutral-500">
            {isDe ? "Assets werden geladen…" : "Loading assets…"}
          </p>
        ) : galleryAssets.length === 0 ? (
          <p className="mt-2 text-xs text-neutral-500">{copy.assetsEmpty}</p>
        ) : (
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {galleryAssets.map((asset) => {
              const checked = selectedIds.has(asset.id);
              return (
                <li key={asset.id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-white/[0.08] bg-[#070A12]/60 p-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAsset(asset.id)}
                      className="mt-1"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                        {asset.outputType}
                      </span>
                      <p className="mt-0.5 line-clamp-2 text-xs text-white/75">
                        {asset.prompt?.trim() ||
                          (isDe ? "Generiertes Asset" : "Generated asset")}
                      </p>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void runPrepare()}
          disabled={!canPrepare}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-500/35 bg-sky-500/10 px-4 py-2.5 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Layers3 className="h-3.5 w-3.5" aria-hidden />
          )}
          {loading ? copy.preparing : copy.prepareCta}
        </button>
        {selectedAssets.length > 0 ? (
          <button
            type="button"
            onClick={downloadSelected}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white/80 transition hover:bg-white/[0.08]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            {copy.downloadAll}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-xs text-amber-400/90" role="status">
          {error}
        </p>
      ) : null}

      {manifest ? (
        <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <CopyButton
              text={manifestCopyText}
              label={copy.copyManifest}
              isDe={isDe}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              {copy.formatsLabel}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {manifest.formatSuggestions.map((format) => (
                <div
                  key={format.platform}
                  className="rounded-xl border border-[#22D3EE]/20 bg-[#22D3EE]/5 p-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#67E8F9]">
                    {format.platform}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/85">
                    {format.aspectRatio}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {format.resolutionHint}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    {format.usageNote}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {copy.captionsLabel}
              </p>
              <CopyButton
                text={captionsCopyText}
                label={copy.copyCaptions}
                isDe={isDe}
              />
            </div>
            <ul className="mt-2 space-y-1.5">
              {manifest.captions.map((caption) => (
                <li
                  key={caption}
                  className="rounded-lg border border-white/[0.06] bg-[#070A12]/80 px-2.5 py-1.5 text-xs text-white/75"
                >
                  {caption}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {copy.hashtagsLabel}
              </p>
              <CopyButton
                text={hashtagsCopyText}
                label={copy.copyHashtags}
                isDe={isDe}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {manifest.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[11px] font-medium text-amber-400/90"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {manifest.selectedAssets.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {copy.assetsLabel}
              </p>
              <ul className="mt-2 space-y-2">
                {manifest.selectedAssets.map((asset) => (
                  <li
                    key={asset.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#070A12]/80 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                        {asset.outputType}
                      </p>
                      <p className="line-clamp-1 text-xs text-white/75">
                        {asset.prompt?.trim() || asset.id}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadExportAsset(asset.url)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300"
                    >
                      <Download className="h-3 w-3" aria-hidden />
                      {copy.downloadAsset}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400/90">
              {copy.hdUpscaleTitle}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
              {copy.hdUpscaleNote}
            </p>
            <p className="mt-2 text-xs font-bold text-amber-300">
              {manifest.hdUpscaleCreditHint}{" "}
              {copy.hdUpscaleCredits}
            </p>
          </div>

          <p className="text-[11px] text-neutral-500">{manifest.exportPolicyNote}</p>
        </div>
      ) : null}
    </section>
  );
}
