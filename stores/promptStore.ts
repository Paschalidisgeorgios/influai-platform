import { create } from "zustand";

type PromptState = {
  prompt: string;
  ghostSuggestion: string | null;
  isOptimizing: boolean;
  acceptedGhost: boolean;
  setPrompt: (value: string) => void;
  setGhostSuggestion: (value: string | null) => void;
  setOptimizing: (value: boolean) => void;
  acceptGhost: () => void;
  dismissGhost: () => void;
  reset: () => void;
};

/** Simulierte Prompt-Optimierung — später durch API ersetzen */
function buildGhostSuggestion(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length < 8) return null;
  return `${trimmed}, premium studio lighting, sharp subject focus, social-ready composition, clean background`;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  prompt: "",
  ghostSuggestion: null,
  isOptimizing: false,
  acceptedGhost: false,
  setPrompt: (value) => {
    set({
      prompt: value,
      acceptedGhost: false,
      ghostSuggestion: buildGhostSuggestion(value),
      isOptimizing: false,
    });
  },
  setGhostSuggestion: (value) => set({ ghostSuggestion: value }),
  setOptimizing: (value) => set({ isOptimizing: value }),
  acceptGhost: () => {
    const { ghostSuggestion } = get();
    if (!ghostSuggestion) return;
    set({ prompt: ghostSuggestion, ghostSuggestion: null, acceptedGhost: true });
  },
  dismissGhost: () => set({ ghostSuggestion: null }),
  reset: () =>
    set({
      prompt: "",
      ghostSuggestion: null,
      isOptimizing: false,
      acceptedGhost: false,
    }),
}));
