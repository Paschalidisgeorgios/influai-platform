/** Relative time for gallery cards (EN / DE). */
export function formatRelativeTime(
  iso: string | null | undefined,
  language: "en" | "de"
): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const diffMs = Date.now() - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (language === "de") {
    if (diffSec < 60) return "gerade eben";
    if (diffMin < 60) return `vor ${diffMin} Min.`;
    if (diffHour < 24) return `vor ${diffHour} Std.`;
    if (diffDay < 7) return `vor ${diffDay} Tagen`;
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "numeric",
      month: "short",
    });
  }

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hr ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}
