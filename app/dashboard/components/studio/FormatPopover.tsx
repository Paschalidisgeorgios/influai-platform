"use client";

import { useState } from "react";

const FORMATS = [
  { value: "square", ratio: "1:1", labelEn: "Square", labelDe: "Quadrat" },
  { value: "tiktok", ratio: "9:16", labelEn: "Vertical", labelDe: "Vertikal" },
  { value: "youtube_thumbnail", ratio: "16:9", labelEn: "Wide", labelDe: "Breit" },
  { value: "instagram_post", ratio: "4:5", labelEn: "Portrait", labelDe: "Portrait" },
  { value: "instagram_story", ratio: "3:4", labelEn: "Story", labelDe: "Story" },
] as const;

function wireAspect(value: string): { w: number; h: number } {
  switch (value) {
    case "tiktok":
    case "instagram_story":
      return { w: 9, h: 16 };
    case "youtube_thumbnail":
      return { w: 16, h: 9 };
    case "instagram_post":
      return { w: 4, h: 5 };
    default:
      return { w: 1, h: 1 };
  }
}

type FormatPopoverProps = {
  value: string;
  onChange: (value: string) => void;
  language: "de" | "en";
};

export default function FormatPopover({
  value,
  onChange,
  language,
}: FormatPopoverProps) {
  const [open, setOpen] = useState(false);
  const active = FORMATS.find((f) => f.value === value) ?? FORMATS[0];
  const aspect = wireAspect(active.value);

  return (
    <div className="relative">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {language === "de" ? "Format" : "Format"}
      </p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:border-gray-300"
      >
        <span>
          {language === "de" ? active.labelDe : active.labelEn} · {active.ratio}
        </span>
        <span className="text-slate-400">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:right-auto sm:max-w-lg">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-wrap gap-2">
              {FORMATS.map((format) => {
                const selected = value === format.value;
                return (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => {
                      onChange(format.value);
                      setOpen(false);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      selected
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-slate-700 hover:border-orange-300"
                    }`}
                  >
                    {format.ratio}
                  </button>
                );
              })}
            </div>
            <div
              className={`flex shrink-0 items-center justify-center rounded-xl border-2 p-4 transition ${
                value === active.value
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
              style={{ width: 88, height: 88 }}
            >
              <div
                className="rounded border-2 border-orange-400 bg-orange-100/50"
                style={{
                  width: `${(aspect.w / Math.max(aspect.w, aspect.h)) * 56}px`,
                  height: `${(aspect.h / Math.max(aspect.w, aspect.h)) * 56}px`,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
