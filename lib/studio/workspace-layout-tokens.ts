/**
 * Dashboard agent workspace — fixed outer dimensions (no category-switch layout shift).
 */

/** Matches StudioWorkspaceShell inner row — do not animate height on parents. */
export const STUDIO_WORKSPACE_SHELL_ROW =
  "flex min-w-0 flex-col overflow-x-hidden overflow-y-hidden md:flex-row md:items-stretch";

export const STUDIO_WORKSPACE_MAIN_COLUMN =
  "flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-hidden";

/** ContextActionBar slot — horizontal chips on mobile; grid scroll on md+. */
export const STUDIO_CONTEXT_ACTION_SLOT =
  "flex h-[8.75rem] min-h-[8.75rem] max-h-[8.75rem] shrink-0 flex-col overflow-hidden md:h-[12.75rem] md:min-h-[12.75rem] md:max-h-[12.75rem]";

export const STUDIO_AGENT_WORKSPACE_SLOT =
  "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden";
