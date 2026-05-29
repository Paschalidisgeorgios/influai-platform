"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import {
  LIP_SYNC_FEMALE_VOICES,
  LIP_SYNC_MALE_VOICES,
  type VoiceOption,
} from "@/lib/lip-sync/voice-options";
import { isClientVoiceConfigured } from "@/lib/lip-sync/elevenlabs-voices";

export type LipSyncVoiceLibraryCopy = {
  title: string;
  subtitle: string;
  femaleSection: string;
  maleSection: string;
  recommendedBadge: string;
  notConfiguredYet: string;
  previewNotAvailable: string;
};

type LipSyncVoiceLibraryProps = {
  copy: LipSyncVoiceLibraryCopy;
  voiceKey: string;
  onVoiceKeyChange: (key: string) => void;
  isEnabled: boolean;
  language: "en" | "de";
};

function LipSyncVoiceOptionCard({
  voice,
  selected,
  configured,
  playing,
  copy,
  onSelect,
  onPreview,
}: {
  voice: VoiceOption;
  selected: boolean;
  configured: boolean;
  playing: boolean;
  copy: LipSyncVoiceLibraryCopy;
  onSelect: (key: string) => void;
  onPreview: (voice: VoiceOption, event: React.MouseEvent) => void;
}) {
  return (
    <div
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 transition ${
        selected
          ? "border-orange-500 bg-orange-50/40 shadow-sm ring-1 ring-orange-500"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      } ${!configured ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        aria-pressed={selected}
        disabled={!configured}
        onClick={() => onSelect(voice.key)}
        className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{voice.label}</span>
          {voice.recommended ? (
            <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
              {copy.recommendedBadge}
            </span>
          ) : null}
        </div>
        {!configured ? (
          <p className="mt-0.5 text-xs font-medium text-amber-700">
            {copy.notConfiguredYet}
          </p>
        ) : null}
      </button>

      <button
        type="button"
        aria-label={playing ? "Pause preview" : "Play preview"}
        disabled={!configured}
        onClick={(event) => onPreview(voice, event)}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed ${
          selected
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-gray-100 text-slate-600 hover:bg-orange-500 hover:text-white"
        }`}
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Play className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
    </div>
  );
}

export default function LipSyncVoiceLibrary({
  copy,
  voiceKey,
  onVoiceKeyChange,
  isEnabled,
  language,
}: LipSyncVoiceLibraryProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingVoiceKey, setPlayingVoiceKey] = useState<string | null>(null);
  const [voicePreviewError, setVoicePreviewError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  function previewUnavailableMessage() {
    return language === "de" ? copy.previewNotAvailable : copy.previewNotAvailable;
  }

  function handlePreviewVoice(voice: VoiceOption, event: React.MouseEvent) {
    event.stopPropagation();
    if (!isEnabled || !isClientVoiceConfigured(voice.key)) return;

    try {
      setVoicePreviewError(null);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (playingVoiceKey === voice.key) {
        setPlayingVoiceKey(null);
        audioRef.current = null;
        return;
      }

      const audio = new Audio(voice.previewPath);
      audioRef.current = audio;
      setPlayingVoiceKey(voice.key);
      onVoiceKeyChange(voice.key);

      audio.onended = () => {
        setPlayingVoiceKey(null);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPlayingVoiceKey(null);
        audioRef.current = null;
        setVoicePreviewError(previewUnavailableMessage());
      };

      void audio.play().catch(() => {
        setPlayingVoiceKey(null);
        audioRef.current = null;
        setVoicePreviewError(previewUnavailableMessage());
      });
    } catch {
      setPlayingVoiceKey(null);
      audioRef.current = null;
      setVoicePreviewError(previewUnavailableMessage());
    }
  }

  function renderSection(sectionLabel: string, voices: VoiceOption[]) {
    return (
      <section className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          {sectionLabel}
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {voices.map((voice) => (
            <LipSyncVoiceOptionCard
              key={voice.key}
              voice={voice}
              selected={voiceKey === voice.key}
              configured={isEnabled && isClientVoiceConfigured(voice.key)}
              playing={playingVoiceKey === voice.key}
              copy={copy}
              onSelect={onVoiceKeyChange}
              onPreview={handlePreviewVoice}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div
      id="lip-sync-voice-library"
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <h3 className="text-sm font-bold text-slate-900">{copy.title}</h3>
      <p className="mt-1 text-xs text-slate-500">{copy.subtitle}</p>

      <div className="mt-4 space-y-5">
        {renderSection(copy.femaleSection, LIP_SYNC_FEMALE_VOICES)}
        {renderSection(copy.maleSection, LIP_SYNC_MALE_VOICES)}
      </div>

      {voicePreviewError ? (
        <p className="mt-3 text-xs font-medium text-red-600">{voicePreviewError}</p>
      ) : null}
    </div>
  );
}
