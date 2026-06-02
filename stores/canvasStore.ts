import { create } from "zustand";

export type CanvasAssetType = "image" | "video";

export type CanvasAsset = {
  id: string;
  type: CanvasAssetType;
  url: string;
  prompt: string;
  thumbnailUrl?: string;
  createdAt: string;
  modelId?: string;
};

type CanvasState = {
  assets: CanvasAsset[];
  selectedAssetId: string | null;
  isGenerating: boolean;
  generationMessage: string | null;
  addAsset: (asset: CanvasAsset) => void;
  removeAsset: (id: string) => void;
  selectAsset: (id: string | null) => void;
  setGenerating: (value: boolean, message?: string | null) => void;
  clearCanvas: () => void;
};

export const useCanvasStore = create<CanvasState>((set) => ({
  assets: [],
  selectedAssetId: null,
  isGenerating: false,
  generationMessage: null,
  addAsset: (asset) =>
    set((state) => ({
      assets: [asset, ...state.assets],
      selectedAssetId: asset.id,
    })),
  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
      selectedAssetId:
        state.selectedAssetId === id ? null : state.selectedAssetId,
    })),
  selectAsset: (id) => set({ selectedAssetId: id }),
  setGenerating: (value, message = null) =>
    set({ isGenerating: value, generationMessage: message }),
  clearCanvas: () =>
    set({ assets: [], selectedAssetId: null, isGenerating: false }),
}));

export function useSelectedCanvasAsset(): CanvasAsset | null {
  return useCanvasStore((state) => {
    if (!state.selectedAssetId) return null;
    return state.assets.find((a) => a.id === state.selectedAssetId) ?? null;
  });
}
