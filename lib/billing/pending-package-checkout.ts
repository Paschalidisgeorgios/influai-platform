import {
  startCreditPackageCheckout,
  type CheckoutResult,
  type PackageKey,
} from "@/app/lib/billing/credit-packages";

export const PENDING_PACKAGE_STORAGE_KEY = "influexai-pending-package";

/** User-facing slugs in URLs and marketing copy. */
export type UserPackageSlug = "starter" | "creator" | "pro";

const VALID_KEYS: readonly PackageKey[] = [
  "starter",
  "professional",
  "ultimate",
] as const;

export function isPackageKey(value: string): value is PackageKey {
  return (VALID_KEYS as readonly string[]).includes(value);
}

/** Maps starter / creator / pro and internal keys to Stripe checkout packageKey. */
export function normalizePackageKey(
  input: string | null | undefined
): PackageKey | null {
  if (!input) return null;
  const key = input.trim().toLowerCase();
  if (key === "starter") return "starter";
  if (key === "creator" || key === "professional") return "professional";
  if (key === "pro" || key === "ultimate") return "ultimate";
  if (isPackageKey(key)) return key;
  return null;
}

export function setPendingPackage(
  input: PackageKey | UserPackageSlug | string
): void {
  if (typeof window === "undefined") return;
  const normalized = normalizePackageKey(input);
  if (!normalized) return;
  window.sessionStorage.setItem(PENDING_PACKAGE_STORAGE_KEY, normalized);
}

export function getPendingPackage(): PackageKey | null {
  if (typeof window === "undefined") return null;
  return normalizePackageKey(
    window.sessionStorage.getItem(PENDING_PACKAGE_STORAGE_KEY)
  );
}

export function clearPendingPackage(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_PACKAGE_STORAGE_KEY);
}

/** After auth — continue Stripe checkout or fall back to credits page. */
export async function continuePendingPackageCheckout(
  accessToken: string
): Promise<CheckoutResult & { packageKey?: PackageKey }> {
  const packageKey = getPendingPackage();
  if (!packageKey) return { error: "No pending package." };

  clearPendingPackage();
  const result = await startCreditPackageCheckout(
    packageKey,
    accessToken,
    typeof window !== "undefined" ? window.location.origin : undefined
  );
  return { ...result, packageKey };
}

/** Public slug for URLs (?package=creator). */
export function packageKeyToUserSlug(key: PackageKey): UserPackageSlug {
  if (key === "professional") return "creator";
  if (key === "ultimate") return "pro";
  return "starter";
}

export function pricingPageHref(packageKey?: PackageKey | null): string {
  if (!packageKey) return "/pricing?open=1";
  return `/pricing?package=${packageKeyToUserSlug(packageKey)}&open=1`;
}

export function creditsPageHref(packageKey?: PackageKey | null): string {
  if (!packageKey) return "/dashboard/credits";
  return `/dashboard/credits?package=${packageKeyToUserSlug(packageKey)}&autoCheckout=1`;
}

/** Sync ?package= in the address bar without navigation (landing / pricing). */
export function syncPackageUrlParam(packageKey: PackageKey): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("package", packageKeyToUserSlug(packageKey));
  window.history.replaceState(window.history.state, "", url.toString());
}
