import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CREDIT_PACKAGES: Record<string, number> = {
  starter: 100,
  professional: 500,
  ultimate: 2000,
};

async function hasAlreadyCredited(stripeSessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("credit_transactions")
    .select("id")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();

  if (error) {
    console.error("Credit transaction duplicate check error:", error);
    throw new Error("Duplicate check failed");
  }

  return Boolean(data);
}

async function creditUser({
  userId,
  creditsToAdd,
  packageKey,
  stripeSessionId,
}: {
  userId: string;
  creditsToAdd: number;
  packageKey: string;
  stripeSessionId: string;
}) {
  const { data: existingCredits, error: fetchCreditsError } =
    await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();

  if (fetchCreditsError) {
    console.error("User credits fetch error:", fetchCreditsError);
    throw new Error("User credits fetch failed");
  }

  const currentCredits = existingCredits?.credits ?? 0;
  const nextCredits = currentCredits + creditsToAdd;

  const { error: upsertCreditsError } = await supabaseAdmin
    .from("user_credits")
    .upsert(
      {
        user_id: userId,
        credits: nextCredits,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (upsertCreditsError) {
    console.error("User credits upsert error:", upsertCreditsError);
    throw new Error("User credits update failed");
  }

  const { error: transactionError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: creditsToAdd,
      type: "purchase",
      source: `stripe_${packageKey}`,
      stripe_session_id: stripeSessionId,
    });

  if (transactionError) {
    console.error("Credit transaction insert error:", transactionError);
    throw new Error("Credit transaction insert failed");
  }

  return nextCredits;
}

async function logStripeWebhookEvent({
  eventId,
  eventType,
  stripeObjectId,
}: {
  eventId: string;
  eventType: string;
  stripeObjectId: string;
}) {
  const { error } = await supabaseAdmin
    .from("stripe_webhook_events")
    .upsert(
      {
        id: eventId,
        type: eventType,
        stripe_object_id: stripeObjectId,
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    console.error("Stripe webhook event log error:", error);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Stripe webhook signature error:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({
      received: true,
      ignored: true,
      type: event.type,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId;
  const packageKey = session.metadata?.packageKey;
  const stripeSessionId = session.id;

  if (!userId || !packageKey) {
    console.error("Missing Stripe metadata:", {
      userId,
      packageKey,
      sessionId: stripeSessionId,
    });

    await logStripeWebhookEvent({
      eventId: event.id,
      eventType: event.type,
      stripeObjectId: stripeSessionId,
    });

    return NextResponse.json(
      { error: "Missing required metadata" },
      { status: 400 }
    );
  }

  const creditsToAdd = CREDIT_PACKAGES[packageKey];

  if (!creditsToAdd) {
    console.error("Invalid credit package:", {
      packageKey,
      sessionId: stripeSessionId,
    });

    await logStripeWebhookEvent({
      eventId: event.id,
      eventType: event.type,
      stripeObjectId: stripeSessionId,
    });

    return NextResponse.json(
      { error: "Invalid credit package" },
      { status: 400 }
    );
  }

  try {
    const alreadyCredited = await hasAlreadyCredited(stripeSessionId);

    if (alreadyCredited) {
      await logStripeWebhookEvent({
        eventId: event.id,
        eventType: event.type,
        stripeObjectId: stripeSessionId,
      });

      return NextResponse.json({
        received: true,
        duplicate: true,
        alreadyCredited: true,
        stripeSessionId,
      });
    }

    const nextCredits = await creditUser({
      userId,
      creditsToAdd,
      packageKey,
      stripeSessionId,
    });

    await logStripeWebhookEvent({
      eventId: event.id,
      eventType: event.type,
      stripeObjectId: stripeSessionId,
    });

    return NextResponse.json({
      received: true,
      credited: true,
      userId,
      packageKey,
      creditsAdded: creditsToAdd,
      creditsTotal: nextCredits,
      stripeSessionId,
    });
  } catch (error) {
    console.error("Credit webhook processing error:", error);

    return NextResponse.json(
      { error: "Credit webhook processing failed" },
      { status: 500 }
    );
  }
}