"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkspaceResult } from "../components/studio/WorkspaceResultPanel";

export type WorkspacePreviewState =
  | { status: "idle" }
  | { status: "loading"; message?: string }
  | { status: "error"; message: string }
  | { status: "success"; result: WorkspaceResult };

type GenerationRow = {
  id: string;
  status?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  error_message?: string | null;
  prompt?: string | null;
  model?: string | null;
};

const POLL_MS = 4000;
const MAX_POLLS = 45;

export function useWorkspaceGeneration(getToken: () => Promise<string | null>) {
  const [preview, setPreview] = useState<WorkspacePreviewState>({ status: "idle" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

  const resetPreview = useCallback(() => {
    stopPolling();
    setPreview({ status: "idle" });
  }, [stopPolling]);

  const clearPreviewError = useCallback(() => {
    setPreview((prev) => (prev.status === "error" ? { status: "idle" } : prev));
  }, []);

  const setLoading = useCallback((message?: string) => {
    setPreview({ status: "loading", message });
  }, []);

  const setError = useCallback((message: string) => {
    stopPolling();
    setPreview({ status: "error", message });
  }, [stopPolling]);

  const setSuccess = useCallback((result: WorkspaceResult) => {
    stopPolling();
    setPreview({ status: "success", result });
  }, [stopPolling]);

  const fetchGeneration = useCallback(
    async (generationId: string): Promise<GenerationRow | null> => {
      const token = await getToken();
      if (!token) return null;
      const res = await fetch("/api/generations?limit=60", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        generations?: GenerationRow[];
        items?: GenerationRow[];
      };
      const rows = data.generations ?? data.items ?? [];
      return rows.find((g) => g.id === generationId) ?? null;
    },
    [getToken]
  );

  const pollGeneration = useCallback(
    (generationId: string, language: "en" | "de" = "en") => {
      stopPolling();
      setPreview({
        status: "loading",
        message:
          language === "de"
            ? "Generierung läuft …"
            : "Generation in progress …",
      });

      const tick = async () => {
        attemptsRef.current += 1;
        const row = await fetchGeneration(generationId);
        if (!row) {
          if (attemptsRef.current >= MAX_POLLS) {
            setError(
              language === "de"
                ? "Zeitüberschreitung — bitte Assets prüfen."
                : "Timed out — check Assets for status."
            );
          }
          return;
        }

        const status = (row.status ?? "").toLowerCase();
        if (status === "completed" || status === "succeeded" || status === "success") {
          if (row.video_url) {
            setSuccess({
              type: "video",
              url: row.video_url,
              prompt: row.prompt ?? undefined,
              model: row.model ?? undefined,
            });
            return;
          }
          if (row.image_url) {
            setSuccess({
              type: "image",
              url: row.image_url,
              prompt: row.prompt ?? undefined,
              model: row.model ?? undefined,
            });
            return;
          }
          setPreview({
            status: "loading",
            message:
              language === "de"
                ? "Abgeschlossen — Medien werden geladen …"
                : "Completed — loading media …",
          });
          return;
        }

        if (status === "failed" || status === "error" || status === "cancelled") {
          setError(
            row.error_message?.trim() ||
              (language === "de"
                ? "Generierung fehlgeschlagen. Credits wurden erstattet."
                : "Generation failed. Credits were refunded.")
          );
          return;
        }

        if (attemptsRef.current >= MAX_POLLS) {
          setError(
            language === "de"
              ? "Zeitüberschreitung — bitte Assets prüfen."
              : "Timed out — check Assets for status."
          );
        }
      };

      void tick();
      pollRef.current = setInterval(() => void tick(), POLL_MS);
    },
    [fetchGeneration, setError, setSuccess, stopPolling]
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

  return {
    preview,
    setPreview,
    setLoading,
    setError,
    setSuccess,
    resetPreview,
    clearPreviewError,
    pollGeneration,
    stopPolling,
  };
}

/** Convert MVP planner objects into readable preview sections. */
export function planToTextResult(
  plan: Record<string, unknown>,
  language: "en" | "de"
): WorkspaceResult {
  const sections: { title: string; content: string }[] = [];

  if (typeof plan.idea === "string" && plan.idea.trim()) {
    sections.push({
      title: language === "de" ? "Idee" : "Idea",
      content: plan.idea,
    });
  }
  if (typeof plan.title === "string" && plan.title.trim()) {
    sections.push({ title: language === "de" ? "Titel" : "Title", content: plan.title });
  }
  if (Array.isArray(plan.schedule)) {
    sections.push({
      title: language === "de" ? "Zeitplan" : "Schedule",
      content: (plan.schedule as { day?: number; caption?: string }[])
        .slice(0, 7)
        .map((d) => `Day ${d.day ?? "?"}: ${d.caption ?? ""}`)
        .join("\n"),
    });
  }
  if (Array.isArray(plan.jobs)) {
    sections.push({
      title: language === "de" ? "Varianten" : "Variants",
      content: String((plan.jobs as unknown[]).length),
    });
  }
  if (typeof plan.script === "string") {
    sections.push({
      title: language === "de" ? "Skript" : "Script",
      content: plan.script.slice(0, 500),
    });
  }
  if (Array.isArray(plan.steps)) {
    sections.push({
      title: language === "de" ? "Workflow" : "Workflow",
      content: (plan.steps as string[]).join(" → "),
    });
  }
  if (typeof plan.status === "string") {
    sections.push({ title: "Status", content: plan.status });
  }

  if (sections.length === 0) {
    return {
      type: "text",
      content:
        language === "de"
          ? "Plan wurde erstellt. Öffne Assets für weitere Schritte."
          : "Plan created. Open Assets for next steps.",
    };
  }

  return { type: "text", content: sections[0]?.content ?? "", sections };
}
