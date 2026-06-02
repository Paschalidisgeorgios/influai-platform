/**
 * Krea response extractors — all output types.
 * @see lib/krea/response-extract.ts
 */

export {
  extractImageUrl,
  extractVideoUrl,
  extractProviderJobId,
  responseShapeKeys,
} from "./response-extract";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function firstString(values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

export function extractAudioUrl(data: unknown): string | null {
  const root = asRecord(data);
  if (!root) return null;
  const output = asRecord(root.output) ?? asRecord(root.result);
  return firstString([
    root.audio_url,
    root.audioUrl,
    output?.audio_url,
    output?.audioUrl,
    asRecord(root.result)?.audio_url,
    asRecord(root.data)?.audio_url,
  ]);
}

export function extractMeshUrl(data: unknown): string | null {
  const root = asRecord(data);
  if (!root) return null;
  const output = asRecord(root.output) ?? asRecord(root.result);
  return firstString([
    root.mesh_url,
    root.meshUrl,
    root.model_url,
    root.modelUrl,
    output?.mesh_url,
    output?.model_url,
    asRecord(root.result)?.mesh_url,
  ]);
}

export function extractStyleId(data: unknown): string | null {
  const root = asRecord(data);
  if (!root) return null;
  const output = asRecord(root.output) ?? asRecord(root.result);
  return firstString([
    root.style_id,
    root.styleId,
    root.id,
    output?.style_id,
    output?.styleId,
    asRecord(root.result)?.style_id,
  ]);
}

export function extractTextOutput(data: unknown): string | null {
  const root = asRecord(data);
  if (!root) return null;
  const text = root.text ?? root.content ?? asRecord(root.result)?.text;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}
