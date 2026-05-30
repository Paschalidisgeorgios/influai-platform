/** Shared workspace types — decoupled from legacy studio UI components. */

export type ModelOption = {
  value: string;
  label: string;
  note?: string;
  disabled?: boolean;
  credits?: number;
  availability?: "active" | "experimental" | "not_configured" | "hidden";
};

export type WorkspaceResult =
  | {
      type: "image";
      url: string;
      prompt?: string;
      model?: string;
      format?: string;
      credits?: number;
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
