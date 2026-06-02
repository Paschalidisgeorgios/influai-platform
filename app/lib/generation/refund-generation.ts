/**
 * Single-refund helper — prevents double refunds within a generation run.
 */

import { hasRefundLedgerEntry } from "@/app/lib/packs/refund-pack-job";
import { refundUserCredits } from "@/lib/generation/poc-shared";
import { markGenerationFailed } from "@/lib/generation/poc-shared";
import type { GenerationRunContext } from "./types";

function generationRefundSource(generationId: string): string {
  return `generation_refund:${generationId}`;
}

/** Ledger-backed refund — at most one refund per generation id (or fallback source). */
export async function refundChargedGenerationOnce(params: {
  userId: string;
  creditsToRefund: number;
  generationId?: string | null;
  fallbackSource: string;
}): Promise<boolean> {
  const { userId, creditsToRefund, generationId, fallbackSource } = params;
  if (creditsToRefund <= 0) return false;

  const source = generationId?.trim()
    ? generationRefundSource(generationId.trim())
    : fallbackSource;

  if (await hasRefundLedgerEntry(source)) {
    return false;
  }

  await refundUserCredits({
    userId,
    creditsToRefund,
    source,
  });

  return true;
}

export async function refundGenerationOnce(
  ctx: GenerationRunContext,
  source: string,
  errorMessage?: string
): Promise<boolean> {
  if (ctx.creditsRefunded || ctx.creditsCharged <= 0) {
    return false;
  }

  const ledgerSource = ctx.generationId
    ? generationRefundSource(ctx.generationId)
    : source;

  if (await hasRefundLedgerEntry(ledgerSource)) {
    ctx.creditsRefunded = true;
    return false;
  }

  await refundUserCredits({
    userId: ctx.userId,
    creditsToRefund: ctx.creditsCharged,
    source: ledgerSource,
  });

  ctx.creditsRefunded = true;

  if (ctx.generationId && errorMessage) {
    await markGenerationFailed({
      generationId: ctx.generationId,
      errorMessage,
    });
  }

  return true;
}
