/**
 * Robust URL / job-id extraction from Krea (and similar) API payloads.
 * Server-only — never log API keys.
 */

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

export function extractProviderJobId(response: unknown): string | null {
  const root = asRecord(response);
  if (!root) return null;
  const data = asRecord(root.data) ?? root;
  return firstString([
    data.job_id,
    data.jobId,
    data.id,
    root.job_id,
    root.jobId,
  ]);
}

export function extractImageUrl(response: unknown): string | null {
  const root = asRecord(response);
  if (!root) return null;

  const data = asRecord(root.data) ?? root;
  const result = asRecord(data.result) ?? asRecord(root.result);
  const output = asRecord(data.output) ?? asRecord(root.output);

  const outputArray = Array.isArray(data.output)
    ? data.output
    : Array.isArray(root.output)
      ? root.output
      : null;

  const images = Array.isArray(data.images)
    ? data.images
    : Array.isArray(root.images)
      ? root.images
      : null;

  const firstOutput = outputArray?.[0];
  const firstImage = images?.[0];
  const firstOutputRec = asRecord(firstOutput);
  const firstImageRec = asRecord(firstImage);

  return firstString([
    data.image_url,
    data.imageUrl,
    data.url,
    root.image_url,
    root.imageUrl,
    root.url,
    result?.image_url,
    result?.imageUrl,
    result?.url,
    output?.image_url,
    output?.imageUrl,
    output?.url,
    firstOutputRec?.url,
    firstOutputRec?.image_url,
    firstImageRec?.url,
    Array.isArray(result?.urls) ? (result.urls as unknown[])[0] : null,
    Array.isArray(data.urls) ? (data.urls as unknown[])[0] : null,
  ]);
}

export function extractVideoUrl(response: unknown): string | null {
  const root = asRecord(response);
  if (!root) return null;

  const data = asRecord(root.data) ?? root;
  const result = asRecord(data.result) ?? asRecord(root.result);
  const output = asRecord(data.output) ?? asRecord(root.output);

  return firstString([
    data.video_url,
    data.videoUrl,
    root.video_url,
    root.videoUrl,
    result?.video_url,
    result?.videoUrl,
    output?.video_url,
    output?.videoUrl,
    output?.url,
    result?.url,
    data.url,
  ]);
}

export function responseShapeKeys(response: unknown): string[] {
  const root = asRecord(response);
  if (!root) return [];
  const data = asRecord(root.data);
  const result = asRecord(root.result) ?? asRecord(data?.result);
  return [
    ...Object.keys(root).slice(0, 12),
    ...(data ? [`data:${Object.keys(data).slice(0, 8).join(",")}`] : []),
    ...(result ? [`result:${Object.keys(result).slice(0, 8).join(",")}`] : []),
  ];
}
