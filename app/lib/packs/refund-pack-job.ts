/**
 * Partial pack refunds — one refund per portion key (prevents double refunds).
 */

import { getSupabaseAdmin } from "@/app/lib/supabase-admin";
import { refundUserCredits } from "@/lib/generation/poc-shared";

export function packRefundSource(
  packJobId: string,
  portionKey: string
): string {
  return `social_asset_pack_refund:${packJobId}:${portionKey}`;
}

/** True when a refund ledger entry already exists for this source (prevents double refunds). */
export async function hasRefundLedgerEntry(source: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("id")
    .eq("type", "refund")
    .eq("source", source)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[pack-refund] ledger lookup failed:", error.message);
    return false;
  }

  return Boolean(data?.id);
}

export async function refundPackPortionOnce(params: {
  userId: string;
  packJobId: string;
  portionKey: string;
  amount: number;
}): Promise<boolean> {
  const { userId, packJobId, portionKey, amount } = params;
  if (amount <= 0) return false;

  const source = packRefundSource(packJobId, portionKey);
  if (await hasRefundLedgerEntry(source)) {
    return false;
  }

  await refundUserCredits({
    userId,
    creditsToRefund: amount,
    source,
  });

  return true;
}

export async function refundPackFullOnce(params: {
  userId: string;
  packJobId: string;
  amount: number;
}): Promise<boolean> {
  return refundPackPortionOnce({
    userId: params.userId,
    packJobId: params.packJobId,
    portionKey: "full",
    amount: params.amount,
  });
}
