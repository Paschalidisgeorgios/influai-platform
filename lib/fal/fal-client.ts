import { fal } from "@fal-ai/client";

/** Server-only fal.ai client — never import from client components. */
export function getFalClient() {
  const apiKey = process.env.FAL_KEY;

  if (!apiKey) {
    throw new Error("MISSING_FAL_KEY");
  }

  fal.config({
    credentials: apiKey,
  });

  return fal;
}

export function isFalKeyConfigured(): boolean {
  return Boolean(process.env.FAL_KEY);
}
