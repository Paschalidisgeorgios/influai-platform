"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  getCreatorToolLabel,
  type CreatorToolDefinition,
} from "@/app/lib/tools/creator-tools";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

const NOTIFY_STORAGE_KEY = "influexai-tool-notify";

type NotifyVariant = "request_access" | "notify";

type Props = {
  tool: CreatorToolDefinition;
  language?: "en" | "de";
  variant?: NotifyVariant;
  onBack: () => void;
  onClose: () => void;
};

/** Local-only interest list — no server API, no credits, no provider calls. */
export function supportsLocalToolInterestBackend(): boolean {
  return typeof window !== "undefined" || typeof localStorage !== "undefined";
}

function readNotifyList(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NOTIFY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function saveNotifyInterest(toolId: string): void {
  try {
    const existing = readNotifyList();
    if (existing.includes(toolId)) return;
    window.localStorage.setItem(
      NOTIFY_STORAGE_KEY,
      JSON.stringify([...existing, toolId])
    );
  } catch {
    /* non-blocking */
  }
}

export default function RequestAccessPanel({
  tool,
  language = "en",
  variant = "notify",
  onBack,
  onClose,
}: Props) {
  const isDe = language === "de";
  const label = getCreatorToolLabel(tool, language);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    setAlreadyRegistered(readNotifyList().includes(tool.id));
  }, [tool.id]);

  const handleSubmit = useCallback(() => {
    saveNotifyInterest(tool.id);
    setSubmitted(true);
    setAlreadyRegistered(true);
  }, [tool.id]);

  const preparedMessage = isDe
    ? "Dieser Workflow wird vorbereitet."
    : "This workflow is being prepared.";

  const successMessage = isDe
    ? "Danke — wir informieren dich, sobald dieser Workflow in deinem Studio freigeschaltet ist."
    : "Thanks — we will let you know when this workflow is enabled in your studio.";

  const alreadyMessage = isDe
    ? "Du bist bereits für Updates zu diesem Workflow eingetragen."
    : "You are already signed up for updates on this workflow.";

  const intro =
    variant === "request_access"
      ? isDe
        ? `${label} ist Teil unseres erweiterten Creator-Programms. Hinterlasse dein Interesse — ohne Verpflichtung.`
        : `${label} is part of our extended creator program. Register your interest — no commitment required.`
      : isDe
        ? `${label} startet bald im Creator Studio. Lass dich benachrichtigen, sobald es live ist.`
        : `${label} is launching soon in the Creator Studio. Get notified when it goes live.`;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
        <p className="text-sm font-semibold text-amber-200">{preparedMessage}</p>
      </div>

      {!submitted && !alreadyRegistered ? (
        <>
          <p className="text-sm leading-relaxed text-[#9CA3AF]">{intro}</p>
          <p className="text-xs leading-relaxed text-neutral-500">
            {isDe
              ? "Lokal auf diesem Gerät gespeichert. Keine Credits, keine Provider-Calls, keine E-Mail bis der Workflow bereit ist."
              : "Saved locally on this device. No credits, no provider calls, and no email until the workflow is ready."}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full ${A11Y.previewCta}`}
          >
            {variant === "request_access"
              ? isDe
                ? "Zugang anfragen"
                : "Request access"
              : isDe
                ? "Benachrichtigen"
                : "Notify me"}
          </button>
        </>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
            aria-hidden
          />
          <p className="text-sm leading-relaxed text-emerald-100/90">
            {alreadyRegistered && !submitted ? alreadyMessage : successMessage}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className={`flex-1 ${A11Y.ghostCta}`}
        >
          {isDe ? "Zurück" : "Back"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className={`flex-1 ${A11Y.ghostCta}`}
        >
          {isDe ? "Zurück zur Toolbox" : "Back to toolbox"}
        </button>
      </div>
    </div>
  );
}

export function hasToolNotifyInterest(toolId: string): boolean {
  return readNotifyList().includes(toolId);
}
