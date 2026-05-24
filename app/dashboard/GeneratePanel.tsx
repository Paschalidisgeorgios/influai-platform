"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Character = {
  id: string;
  name: string;
  reference_image_url?: string | null;
};

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
};

type Workflow = "standard" | "face_consistent";

type GeneratePanelProps = {
  charactersRefreshKey?: number;
  regenerateDraft?: RegenerateDraft | null;
  onGenerationComplete?: () => void;
  onClearRegenerateDraft?: () => void;
};

export default function GeneratePanel({
  charactersRefreshKey = 0,
  regenerateDraft = null,
  onGenerationComplete,
  onClearRegenerateDraft,
}: GeneratePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [workflow, setWorkflow] = useState<Workflow>("standard");
  const [generating, setGenerating] = useState(false);
  const [queuedGenerationId, setQueuedGenerationId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const selectedCharacter = characters.find(
    (character) => character.id === selectedCharacterId
  );

  const canUseFaceConsistent =
    Boolean(selectedCharacterId) &&
    Boolean(selectedCharacter?.reference_image_url);

  useEffect(() => {
    loadCharacters();
  }, [charactersRefreshKey]);

  useEffect(() => {
    if (!regenerateDraft) return;

    setPrompt(regenerateDraft.prompt);
    setSelectedCharacterId(regenerateDraft.characterId ?? "");
    setErrorMessage(null);
    setQueuedGenerationId(null);
  }, [regenerateDraft]);

  useEffect(() => {
    if (workflow === "face_consistent" && !canUseFaceConsistent) {
      setWorkflow("standard");
    }
  }, [workflow, canUseFaceConsistent]);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  async function loadCharacters() {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch("/api/characters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load characters");
      }

      setCharacters(data.characters || []);
    } catch (error) {
      console.error("Characters load error:", error);
    }
  }

  function clearDraft() {
    setPrompt("");
    setSelectedCharacterId("");
    setWorkflow("standard");
    setQueuedGenerationId(null);
    setErrorMessage(null);
    onClearRegenerateDraft?.();
  }

  function getSafeErrorMessage(status: number, apiError?: string) {
    if (status === 401) return "Please sign in again.";
    if (status === 402) return "Not enough credits. Please buy more credits.";
    if (status === 404) return "Selected character was not found.";
    if (status === 400) return apiError || "Please check your prompt.";
    return apiError || "Failed to queue generation. Please try again.";
  }

  async function generateImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setGenerating(true);
      setQueuedGenerationId(null);
      setErrorMessage(null);

      if (workflow === "face_consistent" && !canUseFaceConsistent) {
        setErrorMessage(
          "Face Consistent mode requires a selected character with a reference image."
        );
        return;
      }

      const token = await getAccessToken();

      if (!token) {
        setErrorMessage("Please sign in again.");
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          characterId: selectedCharacterId || null,
          workflow,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(getSafeErrorMessage(response.status, data.error));
        return;
      }

      setQueuedGenerationId(data.generationId ?? null);
      setPrompt("");
      setWorkflow("standard");
      onClearRegenerateDraft?.();
      onGenerationComplete?.();
    } catch (error) {
      console.error("Generate error:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">
          AI Studio
        </p>

        <h2 className="mt-3 text-3xl font-black text-white">
          Generate Visual
        </h2>
      </div>

      {regenerateDraft && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
          <div>
            <p className="text-sm font-bold text-white">Regenerate mode</p>
            <p className="mt-1 text-xs text-white/45">
              Existing prompt loaded. Generating again will use credits.
            </p>
          </div>

          <button
            type="button"
            onClick={clearDraft}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {queuedGenerationId && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generation queued. Watch the gallery processing tab.
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={generateImage} className="space-y-4">
        <select
          value={selectedCharacterId}
          onChange={(event) => setSelectedCharacterId(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
        >
          <option value="">No character</option>

          {characters.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
              {character.reference_image_url ? " · reference ready" : ""}
            </option>
          ))}
        </select>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setWorkflow("standard")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              workflow === "standard"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/[0.06] text-white"
            }`}
          >
            <p className="text-sm font-black">Standard</p>
            <p
              className={`mt-1 text-xs ${
                workflow === "standard" ? "text-black/60" : "text-white/45"
              }`}
            >
              Fast general image generation.
            </p>
          </button>

          <button
            type="button"
            disabled={!canUseFaceConsistent}
            onClick={() => setWorkflow("face_consistent")}
            className={`rounded-2xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
              workflow === "face_consistent"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/[0.06] text-white"
            }`}
          >
            <p className="text-sm font-black">Face Consistent</p>
            <p
              className={`mt-1 text-xs ${
                workflow === "face_consistent"
                  ? "text-black/60"
                  : "text-white/45"
              }`}
            >
              Requires a character reference image.
            </p>
          </button>
        </div>

        {!canUseFaceConsistent && selectedCharacterId && (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs font-bold text-yellow-100/80">
            Upload a reference image for this character to unlock Face
            Consistent mode.
          </div>
        )}

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the scene, outfit, lighting, mood, location..."
          required
          className="min-h-36 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
        />

        <button
          type="submit"
          disabled={generating}
          className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {generating
            ? "Queuing..."
            : regenerateDraft
              ? "Queue again"
              : "Queue generation"}
        </button>
      </form>
    </section>
  );
}