/**
 * Internal validation route auth — never expose secret values in responses.
 */

const HEADER_NAME = "x-internal-validation-secret";

export function verifyInternalValidationSecret(req: Request): boolean {
  const provided = req.headers.get(HEADER_NAME)?.trim();
  const expected = process.env.INTERNAL_VALIDATION_SECRET?.trim();
  if (!expected || !provided) return false;
  return provided === expected;
}

export function unauthorizedValidationResponse() {
  return Response.json(
    {
      success: false,
      error: "Unauthorized. Provide a valid internal validation secret header.",
    },
    { status: 401 }
  );
}

export function isRealProviderSmokeTestsEnabled(
  override?: boolean
): boolean {
  if (typeof override === "boolean") return override;
  return process.env.RUN_REAL_PROVIDER_SMOKE_TESTS === "true";
}

export function isTrainingSmokeTestAllowed(override?: boolean): boolean {
  if (typeof override === "boolean") return override;
  return process.env.ALLOW_TRAINING_SMOKE_TESTS === "true";
}

/**
 * Internal smoke-test access — admin session OR validation secret header.
 * Never returns or logs secret values.
 */
export async function verifyInternalSmokeTestAccess(
  req: Request
): Promise<boolean> {
  if (verifyInternalValidationSecret(req)) return true;

  try {
    const { getAdminUser } = await import("@/app/lib/admin/guards");
    const admin = await getAdminUser();
    return admin !== null;
  } catch {
    return false;
  }
}
