/**
 * Server-only feature gates (ENABLE_* env vars).
 * Never import from client components.
 */

function isExplicitlyDisabled(value: string | undefined): boolean {
  return value === "false" || value === "0";
}

/** Motion Transfer / Live Avatar API routes */
export function isMotionTransferServerEnabled(): boolean {
  const motion = process.env.ENABLE_MOTION_TRANSFER;
  const liveAvatar = process.env.ENABLE_LIVE_AVATAR;

  if (isExplicitlyDisabled(motion) || isExplicitlyDisabled(liveAvatar)) {
    return false;
  }

  return motion === "true" || liveAvatar === "true";
}
