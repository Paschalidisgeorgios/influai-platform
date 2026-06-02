export function extractFalImageUrl(result: unknown): string | null {
  const data = result as Record<string, unknown> & {
    data?: Record<string, unknown>;
    images?: Array<{ url?: string }>;
    image?: { url?: string };
    url?: string;
  };

  return (
    (data?.data?.images as Array<{ url?: string }> | undefined)?.[0]?.url ??
    (data?.data?.image as { url?: string } | undefined)?.url ??
    (data?.data?.url as string | undefined) ??
    data?.images?.[0]?.url ??
    data?.image?.url ??
    data?.url ??
    null
  );
}

export function extractFalVideoUrl(result: unknown): string | null {
  const data = result as Record<string, unknown> & {
    data?: Record<string, unknown>;
    video?: { url?: string };
    video_url?: string;
    videos?: Array<{ url?: string }>;
    url?: string;
  };

  return (
    (data?.data?.video as { url?: string } | undefined)?.url ??
    (data?.data?.video_url as string | undefined) ??
    (data?.data?.videos as Array<{ url?: string }> | undefined)?.[0]?.url ??
    data?.video?.url ??
    data?.video_url ??
    data?.videos?.[0]?.url ??
    data?.url ??
    null
  );
}

export function extractFalAudioUrl(result: unknown): string | null {
  const data = result as Record<string, unknown> & {
    data?: Record<string, unknown>;
    audio?: { url?: string };
    audio_url?: string;
  };

  return (
    (data?.data?.audio as { url?: string } | undefined)?.url ??
    (data?.data?.audio_url as string | undefined) ??
    data?.audio?.url ??
    data?.audio_url ??
    null
  );
}
