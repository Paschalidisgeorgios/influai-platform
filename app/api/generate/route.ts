/**
 * Unified generation endpoint — all Create page MVP actions.
 *
 * User Action → Model Mode → Action/Engine resolution → Provider Router → Gallery
 *
 * Brand Kit: active kits are loaded in `runUnifiedGeneration` and injected into
 * the final provider prompt via `buildBrandKitPromptBlock` (see lib/brand/brandKit.ts).
 */

import { runUnifiedGeneration } from "@/app/lib/generation/run-generation";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  return runUnifiedGeneration(req);
}
