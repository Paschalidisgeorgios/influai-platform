import { create } from "zustand";

export type RadialMenuPosition = { x: number; y: number };

export type ViralityResult = {
  score: number;
  hookStrength: number;
  clarity: number;
  composition: number;
  socialReadiness: number;
  summary: string;
};

type UiState = {
  sidebarCollapsed: boolean;
  viralityPanelOpen: boolean;
  viralityResult: ViralityResult | null;
  radialMenuOpen: boolean;
  radialMenuPosition: RadialMenuPosition | null;
  paywallOpen: boolean;
  paywallContext: "hd_export" | "credits" | null;
  activeModelId: string;
  toggleSidebar: () => void;
  openViralityPanel: (result?: ViralityResult | null) => void;
  closeViralityPanel: () => void;
  setViralityResult: (result: ViralityResult | null) => void;
  openRadialMenu: (position: RadialMenuPosition) => void;
  closeRadialMenu: () => void;
  openPaywall: (context: "hd_export" | "credits") => void;
  closePaywall: () => void;
  setActiveModelId: (id: string) => void;
};

const PLACEHOLDER_VIRALITY: ViralityResult = {
  score: 78,
  hookStrength: 82,
  clarity: 74,
  composition: 76,
  socialReadiness: 80,
  summary:
    "Strong visual hook potential. Tighten the opening frame and increase subject contrast for feed scroll-stops.",
};

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  viralityPanelOpen: false,
  viralityResult: null,
  radialMenuOpen: false,
  radialMenuPosition: null,
  paywallOpen: false,
  paywallContext: null,
  activeModelId: "flux-schnell",
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  openViralityPanel: (result) =>
    set({
      viralityPanelOpen: true,
      viralityResult: result ?? PLACEHOLDER_VIRALITY,
    }),
  closeViralityPanel: () => set({ viralityPanelOpen: false }),
  setViralityResult: (result) => set({ viralityResult: result }),
  openRadialMenu: (position) =>
    set({ radialMenuOpen: true, radialMenuPosition: position }),
  closeRadialMenu: () =>
    set({ radialMenuOpen: false, radialMenuPosition: null }),
  openPaywall: (context) => set({ paywallOpen: true, paywallContext: context }),
  closePaywall: () => set({ paywallOpen: false, paywallContext: null }),
  setActiveModelId: (id) => set({ activeModelId: id }),
}));
