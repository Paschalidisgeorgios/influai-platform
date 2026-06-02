import type { SocialAssetPackPanelState } from "@/app/lib/packs/pack-panel-state-machine";

export type PackOverlayControlState = {
  canPreview: boolean;
  canRender: boolean;
  panelState: SocialAssetPackPanelState;
  /** Preview, credit check, or render in flight — block overlay dismiss. */
  busy: boolean;
};

export type AgentPackGeneratorPanelHandle = {
  runPreview: () => void;
  runRender: () => void;
};
