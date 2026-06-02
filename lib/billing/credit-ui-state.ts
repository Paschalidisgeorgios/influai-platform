/**
 * Credit UI state — gating paid render without changing billing/charge logic.
 */

export function areCreditsConfirmed(
  loading: boolean,
  error: boolean
): boolean {
  return !loading && !error;
}

/** Balance for paid-action checks; undefined until credits are confirmed. */
export function creditBalanceForPaidActions(
  loading: boolean,
  error: boolean,
  balance: number
): number | undefined {
  return areCreditsConfirmed(loading, error) ? balance : undefined;
}
