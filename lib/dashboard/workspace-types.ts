/** Shared workspace types — decoupled from legacy studio UI components. */

export type CampaignExpansionData = {
  viral_hooks: string[];
  video_script: string;
  hashtags: string[];
};

export type ModelOption = {
  value: string;
  label: string;
  note?: string;
  disabled?: boolean;
  credits?: number;
  isRecommended?: boolean;
  availability?: "active" | "experimental" | "not_configured" | "failed_validation" | "hidden";
};

export type WorkspaceResult =
  | {
      type: "image";
      url: string;
      prompt?: string;
      model?: string;
      format?: string;
      credits?: number;
      generationId?: string;
      campaignExpansion?: CampaignExpansionData | null;
      campaignExpansionWarning?: string;
    }
  | {
      type: "video";
      url: string;
      prompt?: string;
      model?: string;
      credits?: number;
    }
  | {
      type: "audio";
      url: string;
      prompt?: string;
      model?: string;
      credits?: number;
    }
  | {
      type: "text";
      content: string;
      sections?: { title: string; content: string }[];
    }
  | null;

export type WorkspacePreviewState =
  | { status: "idle" }
  | { status: "loading"; message?: string }
  | { status: "error"; message: string }
  | { status: "success"; result: WorkspaceResult };
