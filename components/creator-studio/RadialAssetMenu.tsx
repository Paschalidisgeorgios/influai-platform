"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Download,
  Palette,
  Play,
} from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { useSelectedCanvasAsset } from "@/stores/canvasStore";
import { HD_EXPORT_CREDIT_COST } from "@/config/models";

const ITEMS = [
  { id: "viral", label: "Creative Score", icon: BarChart3, angle: -90 },
  { id: "animate", label: "Animate", icon: Play, angle: -30 },
  { id: "style", label: "Style", icon: Palette, angle: 30 },
  { id: "export", label: "HD Export", icon: Download, angle: 90 },
] as const;

export default function RadialAssetMenu() {
  const open = useUiStore((s) => s.radialMenuOpen);
  const position = useUiStore((s) => s.radialMenuPosition);
  const closeRadialMenu = useUiStore((s) => s.closeRadialMenu);
  const openViralityPanel = useUiStore((s) => s.openViralityPanel);
  const openPaywall = useUiStore((s) => s.openPaywall);
  const asset = useSelectedCanvasAsset();

  if (!open || !position) return null;

  const radius = 88;

  function handleAction(id: (typeof ITEMS)[number]["id"]) {
    closeRadialMenu();
    if (id === "viral") openViralityPanel();
    if (id === "export") openPaywall("hd_export");
    if (id === "animate") {
      // Placeholder — Image-to-Video gated by launch config
      openPaywall("credits");
    }
    if (id === "style") openViralityPanel();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        onClick={closeRadialMenu}
      >
        <div
          className="pointer-events-none absolute h-0 w-0"
          style={{ left: position.x, top: position.y }}
        >
          {ITEMS.map((item, index) => {
            const rad = (item.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: index * 0.04 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(item.id);
                }}
                style={{ transform: `translate(${x}px, ${y}px)` }}
                className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/40 bg-neutral-950 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.15)] hover:bg-amber-500/10">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-white/80">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/20 bg-black/40 px-3 py-1 text-[10px] text-neutral-400 backdrop-blur-md"
          style={{ left: position.x, top: position.y + 24 }}
        >
          {asset?.type === "video" ? "Video asset" : "Image asset"}
          {ITEMS.find((i) => i.id === "export")
            ? ` · HD ${HD_EXPORT_CREDIT_COST}c`
            : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
