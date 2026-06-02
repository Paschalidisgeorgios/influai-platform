/** Agent generator stage — overlay body layout (no duplicate workspace chrome). */

export const AGENT_GENERATOR_STAGE_ROOT =
  "relative isolate flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden";

export const AGENT_GENERATOR_STAGE_GRID =
  "flex min-h-0 flex-1 flex-col gap-3 md:grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-4";

export const AGENT_GENERATOR_STAGE_COMPOSE =
  "flex min-h-0 min-w-0 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] md:max-h-full";

export const AGENT_GENERATOR_STAGE_PREVIEW =
  "flex min-h-[11rem] min-w-0 flex-1 flex-col md:min-h-0";

export const AGENT_GENERATOR_STAGE_SCROLL =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]";
