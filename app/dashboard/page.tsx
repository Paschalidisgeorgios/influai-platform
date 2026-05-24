"use client";

import { useEffect, useState } from "react";
import CharacterManager from "./CharacterManager";
import CreditsCard from "./CreditsCard";
import GeneratePanel from "./GeneratePanel";
import GenerationGallery from "./GenerationGallery";

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
};

export default function DashboardPage() {
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [charactersRefreshKey, setCharactersRefreshKey] = useState(0);
  const [creditsRefreshKey, setCreditsRefreshKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [regenerateDraft, setRegenerateDraft] =
    useState<RegenerateDraft | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");

    if (checkout === "success") {
      setStatusMessage("Credits purchased successfully.");
      setCreditsRefreshKey((current) => current + 1);
    }

    if (checkout === "cancelled") {
      setStatusMessage("Checkout cancelled.");
    }

    if (checkout) {
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  function showStatus(message: string) {
    setStatusMessage(message);

    window.setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  }

  function handleGenerationComplete() {
    setGalleryRefreshKey((current) => current + 1);
    setCreditsRefreshKey((current) => current + 1);
    setRegenerateDraft(null);
    showStatus("Generation queued. It will appear in the gallery shortly.");
  }

  function handleRegenerate(prompt: string, characterId: string | null) {
    setRegenerateDraft({
      prompt,
      characterId,
    });

    showStatus("Prompt loaded for regeneration.");
  }

  function handleClearRegenerateDraft() {
    setRegenerateDraft(null);
    showStatus("Regenerate draft cleared.");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-16">
        {statusMessage && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-bold text-white">
            {statusMessage}
          </div>
        )}

        <CreditsCard refreshKey={creditsRefreshKey} />

        <GeneratePanel
          charactersRefreshKey={charactersRefreshKey}
          regenerateDraft={regenerateDraft}
          onClearRegenerateDraft={handleClearRegenerateDraft}
          onGenerationComplete={handleGenerationComplete}
        />

        <CharacterManager
          onCharactersChange={() => {
            setCharactersRefreshKey((current) => current + 1);
            showStatus("Characters updated.");
          }}
        />

        <section className="space-y-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">
              Creator Assets
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              Gallery
            </h2>
          </div>

          <GenerationGallery
            refreshKey={galleryRefreshKey}
            onRegenerate={handleRegenerate}
          />
        </section>
      </div>
    </main>
  );
}