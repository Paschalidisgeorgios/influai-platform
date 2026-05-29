"use client";

type LipSyncMode = "system_voice" | "audio_upload" | "record";

type LipSyncModeCardsProps = {
  mode: LipSyncMode;
  onChange: (mode: LipSyncMode) => void;
  language: "de" | "en";
};

const MODES: {
  id: LipSyncMode;
  titleEn: string;
  titleDe: string;
  subEn: string;
  subDe: string;
}[] = [
  {
    id: "system_voice",
    titleEn: "Generate",
    titleDe: "Generieren",
    subEn: "Write and generate speech",
    subDe: "Text eingeben und Sprache generieren",
  },
  {
    id: "audio_upload",
    titleEn: "Upload",
    titleDe: "Hochladen",
    subEn: "Upload an audio file",
    subDe: "Audiodatei hochladen",
  },
  {
    id: "record",
    titleEn: "Record",
    titleDe: "Aufnehmen",
    subEn: "Record your voice",
    subDe: "Eigene Stimme aufnehmen",
  },
];

export default function LipSyncModeCards({
  mode,
  onChange,
  language,
}: LipSyncModeCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {MODES.map((item) => {
        const active = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-2xl border bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm ${
              active
                ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500"
                : "border-gray-200"
            }`}
          >
            <p className="text-sm font-bold text-slate-900">
              {language === "de" ? item.titleDe : item.titleEn}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {language === "de" ? item.subDe : item.subEn}
            </p>
          </button>
        );
      })}
    </div>
  );
}
