export function isHttpImageUrl(
  value: unknown
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("data:image/")
  ) {
    return false;
  }

  if (trimmed.includes("\n")) {
    return false;
  }

  if (trimmed.length > 4096) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);

    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "data:"
    );
  } catch {
    return trimmed.startsWith("data:image/");
  }
}

export async function extractImageUrlFromItem(
  item: unknown
): Promise<string | null> {
  if (item == null) {
    return null;
  }

  if (isHttpImageUrl(item)) {
    return item.trim();
  }

  if (item instanceof URL) {
    return isHttpImageUrl(item.href)
      ? item.href
      : null;
  }

  if (typeof item === "object") {
    const record = item as Record<string, unknown>;

    if (typeof record.url === "function") {
      try {
        const result = await Promise.resolve(
          (record.url as () => unknown)()
        );
        return extractImageUrlFromItem(result);
      } catch {
        return null;
      }
    }

    if (isHttpImageUrl(record.url)) {
      return String(record.url).trim();
    }

    if (isHttpImageUrl(record.href)) {
      return String(record.href).trim();
    }

    if (isHttpImageUrl(record.image_url)) {
      return String(record.image_url).trim();
    }

    const toString = (item as { toString?: () => string })
      .toString;

    if (typeof toString === "function") {
      const asString = toString.call(item);

      if (
        asString &&
        asString !== "[object Object]" &&
        isHttpImageUrl(asString)
      ) {
        return asString.trim();
      }
    }
  }

  return null;
}

export async function normalizeImageUrlList(
  output: unknown
): Promise<string[]> {
  if (output == null) {
    return [];
  }

  const items = Array.isArray(output)
    ? output
    : [output];

  const urls: string[] = [];

  for (const item of items) {
    const url = await extractImageUrlFromItem(item);

    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls;
}
