"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ImageIcon, Loader2, Video } from "lucide-react";
import { useCanvasStore, useSelectedCanvasAsset } from "@/stores/canvasStore";
import { useUiStore } from "@/stores/uiStore";

export default function StudioCanvas() {
  const assets = useCanvasStore((s) => s.assets);
  const selectedAssetId = useCanvasStore((s) => s.selectedAssetId);
  const selectAsset = useCanvasStore((s) => s.selectAsset);
  const isGenerating = useCanvasStore((s) => s.isGenerating);
  const generationMessage = useCanvasStore((s) => s.generationMessage);
  const selected = useSelectedCanvasAsset();
  const openRadialMenu = useUiStore((s) => s.openRadialMenu);

  function handleAssetClick(
    e: React.MouseEvent<HTMLButtonElement>,
    assetId: string
  ) {
    selectAsset(assetId);
    const rect = e.currentTarget.getBoundingClientRect();
    openRadialMenu({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
          Canvas
        </h2>
        <span className="text-xs text-neutral-600">
          {assets.length} asset{assets.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-[#0a0a0a]">
        {isGenerating ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            <p className="text-sm text-neutral-300">
              {generationMessage ?? "Creating your asset…"}
            </p>
          </div>
        ) : null}

        {selected ? (
          <div className="relative flex-1 p-4">
            <button
              type="button"
              onClick={(e) => handleAssetClick(e, selected.id)}
              className="group relative mx-auto block h-full max-h-[520px] w-full max-w-3xl overflow-hidden rounded-xl border border-amber-500/30 ring-2 ring-amber-500/20"
            >
              {selected.type === "video" ? (
                <video
                  src={selected.url}
                  className="h-full w-full object-contain"
                  controls
                  playsInline
                />
              ) : (
                <Image
                  src={selected.url}
                  alt={selected.prompt}
                  fill
                  className="object-contain"
                  unoptimized
                />
              )}
            </button>
            <p className="mt-3 text-center text-xs text-neutral-500">
              Click asset for actions · {selected.prompt.slice(0, 80)}
              {selected.prompt.length > 80 ? "…" : ""}
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-2xl border border-dashed border-neutral-800 p-6">
              <ImageIcon className="mx-auto h-10 w-10 text-neutral-700" />
            </div>
            <p className="max-w-sm text-sm text-neutral-500">
              Your generated images and videos appear here. Start with a prompt
              above.
            </p>
          </div>
        )}

        {assets.length > 1 ? (
          <div className="border-t border-white/5 p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={(e) => handleAssetClick(e, asset.id)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                    selectedAssetId === asset.id
                      ? "border-amber-500 ring-1 ring-amber-500/40"
                      : "border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  {asset.type === "video" ? (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-900">
                      <Video className="h-5 w-5 text-neutral-500" />
                    </div>
                  ) : (
                    <Image
                      src={asset.thumbnailUrl ?? asset.url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
