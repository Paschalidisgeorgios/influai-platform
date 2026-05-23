import { NextRequest, NextResponse } from "next/server";

import Stripe from "stripe";

import { getSupabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    throw new Error("Stripe is not configured");
  }

  return new Stripe(secret);
}

async function addCredits(
  userId: string,
  creditsToAdd: number
) {
  const supabase = getSupabaseAdmin();

  const { data: existing, error: readError } =
    await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        credits: existing.credits + creditsToAdd,
      })
      .eq("user_id", userId);

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const { error: insertError } = await supabase
    .from("user_credits")
    .insert({
      user_id: userId,
      credits: creditsToAdd,
    });

  if (insertError) {
    throw insertError;
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE WEBHOOK: missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  try {
    const body = await req.text();
    const stripe = getStripe();

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data
        .object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id;
      const creditsRaw = session.metadata?.credits;
      const creditsToAdd = Number(creditsRaw);

      if (!userId || !Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
        console.error(
          "STRIPE WEBHOOK: invalid session metadata",
          { userId, creditsRaw }
        );
      } else {
        await addCredits(userId, creditsToAdd);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Webhook handler failed";

    console.error("STRIPE WEBHOOK ERROR:", message);

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
