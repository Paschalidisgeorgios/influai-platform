"use client";

import { Play } from "lucide-react";
import { KG } from "@/lib/kinetic-glass/classes";
import { STUDIO_FORMATS, type StudioFormatId } from "@/lib/dashboard/v2/constants";

type Props = {
  selectedId: StudioFormatId;
  onSelect: (id: StudioFormatId) => void;
};

function FormatPreview({ id }: { id: StudioFormatId }) {
  if (id === "square") {
    return (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border-2 border-neutral-600 bg-neutral-900/60" />
    );
  }
  if (id === "vertical") {
    return (
      <div className="relative mx-auto flex h-14 w-9 items-center justify-center rounded-md border-2 border-neutral-600 bg-neutral-900/60">
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-neutral-950">
          T
        </span>
      </div>
    );
  }
  return (
    <div className="relative mx-auto flex h-9 w-14 items-center justify-center rounded-md border-2 border-neutral-600 bg-neutral-900/60">
      <Play className="h-4 w-4 fill-white text-white" />
    </div>
  );
}

export default function FormatAspectGrid({ selectedId, onSelect }: Props) {
  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-4 px-4 md:grid-cols-3">
      {STUDIO_FORMATS.map((format) => {
        const selected = format.id === selectedId;
        return (
          <button
            key={format.id}
            type="button"
            onClick={() => onSelect(format.id)}
            className={`rounded-2xl border p-4 text-left backdrop-blur-2xl transition ${
              selected ? KG.engineSelected : KG.engineDefault
            }`}
          >
            <FormatPreview id={format.id} />
            <p className="mt-3 text-sm font-bold">{format.label}</p>
            <p className="text-xs text-neutral-500">{format.subtitle}</p>
          </button>
        );
      })}
    </div>
  );
}
