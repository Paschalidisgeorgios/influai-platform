/**
 * Agent Prompt Workspace — stable outer shell; motion only inside the glass panel.
 */

export const AGENT_PROMPT_WORKSPACE_ROOT =
  "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden";

/** Dominant center glass panel — fixed flex footprint inside StudioWorkspaceShell */
export const AGENT_PROMPT_WORKSPACE_PANEL = [
  "relative isolate flex min-h-0 flex-1 flex-col overflow-hidden",
  "rounded-2xl border border-neutral-800/80",
  "bg-neutral-900/40 backdrop-blur-2xl",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_48px_rgba(0,0,0,0.45)]",
].join(" ");

export const AGENT_PROMPT_WORKSPACE_SCROLL =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]";

export const AGENT_PROMPT_CONTEXT_STRIP =
  "shrink-0 border-b border-white/[0.06] bg-[#050505]/40 px-4 py-3 sm:px-5";

/** Reserved pack hint row on Create — prevents shift when badge toggles */
export const AGENT_PROMPT_PACK_HINT_RESERVE =
  "min-h-[1.5rem] shrink-0 md:min-h-[2.75rem]";

export const AGENT_PROMPT_COMPOSE_COLUMN =
  "flex min-h-0 min-w-0 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain border-b border-white/[0.06] p-3 pb-4 sm:p-5 lg:max-w-[26rem] lg:shrink-0 lg:border-b-0 lg:border-r [-webkit-overflow-scrolling:touch]";

/** Create category — optional agent steps panel slot */
export const AGENT_PROMPT_AGENT_STEPS_RESERVE =
  "order-5 min-h-[9.5rem] max-h-[14rem] shrink-0 overflow-hidden md:order-none md:min-h-[min(304px,38vh)] md:max-h-[min(304px,38vh)]";

export const AGENT_PROMPT_COMPOSE_PROMPT = "order-1 shrink-0 md:order-none";

export const AGENT_PROMPT_COMPOSE_ASSIST = "order-4 md:order-none";

export const AGENT_PROMPT_COMPOSE_CREDIT = "order-2 shrink-0 md:order-none";

export const AGENT_PROMPT_COMPOSE_CTA = "order-3 shrink-0 md:order-none";

export const AGENT_PROMPT_PREVIEW_COLUMN =
  "flex min-h-[12rem] min-w-0 flex-1 flex-col lg:min-h-0";

/** Reserved height — Prompt Assist toggles in-place without pushing layout */
export const AGENT_PROMPT_ASSIST_RESERVE =
  "relative min-h-[7rem] sm:min-h-[9.75rem] md:min-h-[10.5rem]";

export const AGENT_PROMPT_GRID =
  "flex min-h-0 flex-1 flex-col lg:flex-row";
