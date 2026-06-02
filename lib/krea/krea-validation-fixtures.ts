/**
 * Server-side validation fixtures for Krea live tests — never import from client.
 */

const PORTRAIT_EXTENSIONS = /\.(jpg|jpeg|png|webp|heic|heif)(\?|#|$)/i;
const MOTION_VIDEO_EXTENSIONS = /\.(mp4|mov|webm)(\?|#|$)/i;

export type MotionValidationFixturesResult =
  | { ok: true; portraitUrl: string; motionVideoUrl: string }
  | {
      ok: false;
      errorCode: "MISSING_VALIDATION_FIXTURE" | "INVALID_VALIDATION_ASSET_URL";
      message: string;
    };

function validateHttpsAssetUrl(
  url: string,
  label: "portrait" | "motion video",
  allowedExt: RegExp
): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return `Invalid ${label} URL`;
  }
  if (parsed.protocol !== "https:") {
    return `${label} URL must use HTTPS`;
  }
  if (!allowedExt.test(parsed.pathname)) {
    return `${label} URL must use a supported file extension`;
  }
  return null;
}

/** Motion transfer live tests — portrait + driving video from env (admin only). */
export function resolveMotionValidationFixtures(): MotionValidationFixturesResult {
  const portraitUrl = process.env.KREA_VALIDATION_PORTRAIT_URL?.trim() ?? "";
  const motionVideoUrl = process.env.KREA_VALIDATION_MOTION_VIDEO_URL?.trim() ?? "";

  if (!portraitUrl || !motionVideoUrl) {
    return {
      ok: false,
      errorCode: "MISSING_VALIDATION_FIXTURE",
      message:
        "Set KREA_VALIDATION_PORTRAIT_URL and KREA_VALIDATION_MOTION_VIDEO_URL for motion transfer live tests.",
    };
  }

  const portraitError = validateHttpsAssetUrl(
    portraitUrl,
    "portrait",
    PORTRAIT_EXTENSIONS
  );
  if (portraitError) {
    return {
      ok: false,
      errorCode: "INVALID_VALIDATION_ASSET_URL",
      message: portraitError,
    };
  }

  const videoError = validateHttpsAssetUrl(
    motionVideoUrl,
    "motion video",
    MOTION_VIDEO_EXTENSIONS
  );
  if (videoError) {
    return {
      ok: false,
      errorCode: "INVALID_VALIDATION_ASSET_URL",
      message: videoError,
    };
  }

  return { ok: true, portraitUrl, motionVideoUrl };
}

export type PortraitValidationFixtureResult =
  | { ok: true; portraitUrl: string }
  | {
      ok: false;
      errorCode: "MISSING_VALIDATION_FIXTURE" | "INVALID_VALIDATION_ASSET_URL";
      message: string;
    };

/** Enhancer / portrait-based live tests — single image from env (admin only). */
export function resolvePortraitValidationFixture(): PortraitValidationFixtureResult {
  const portraitUrl = process.env.KREA_VALIDATION_PORTRAIT_URL?.trim() ?? "";

  if (!portraitUrl) {
    return {
      ok: false,
      errorCode: "MISSING_VALIDATION_FIXTURE",
      message:
        "Set KREA_VALIDATION_PORTRAIT_URL for enhancer and motion transfer live tests.",
    };
  }

  const portraitError = validateHttpsAssetUrl(
    portraitUrl,
    "portrait",
    PORTRAIT_EXTENSIONS
  );
  if (portraitError) {
    return {
      ok: false,
      errorCode: "INVALID_VALIDATION_ASSET_URL",
      message: portraitError,
    };
  }

  return { ok: true, portraitUrl };
}
