/** Local object URLs used only for in-browser preview — never send to providers. */
export function isBlobMediaUrl(url: string | null | undefined): boolean {
  return typeof url === "string" && url.startsWith("blob:");
}

/** Remote URLs acceptable for fal.ai / worker pipelines. */
export function isRemoteMediaUrl(url: string | null | undefined): boolean {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}
