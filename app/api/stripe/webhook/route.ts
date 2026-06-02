import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getSubscriptionPlanByKey } from "@/lib/subscriptions/plans";

export const runtime = "nodejs";

function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20" as "2026-04-22.dahlia",
  });
}

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
  sourceOverride,
}: {
  userId: string;
  creditsToAdd: number;
  packageKey: string;
  stripeSessionId: string;
  sourceOverride?: string;
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
      source: sourceOverride ?? `stripe_${packageKey}`,
      stripe_session_id: stripeSessionId,
    });

  if (transactionError) {
    console.error("Credit transaction insert error:", transactionError);
    throw new Error("Credit transaction insert failed");
  }

  return nextCredits;
}

async function grantSubscriptionCredits({
  userId,
  creditsToAdd,
  planKey,
}: {
  userId: string;
  creditsToAdd: number;
  planKey: string;
}) {
  if (creditsToAdd <= 0) return;

  const { data: existingCredits, error: fetchCreditsError } =
    await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();

  if (fetchCreditsError) {
    console.error("Subscription credits fetch error:", fetchCreditsError);
    throw new Error("User credits fetch failed");
  }

  const nextCredits = (existingCredits?.credits ?? 0) + creditsToAdd;

  const { error: upsertCreditsError } = await supabaseAdmin
    .from("user_credits")
    .upsert(
      {
        user_id: userId,
        credits: nextCredits,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertCreditsError) {
    console.error("Subscription credits upsert error:", upsertCreditsError);
    throw new Error("User credits update failed");
  }

  const { error: transactionError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: creditsToAdd,
      type: "subscription_grant",
      source: `subscription_${planKey}_monthly`,
    });

  if (transactionError) {
    console.error("Subscription credit transaction error:", transactionError);
    throw new Error("Credit transaction insert failed");
  }
}

function resolveStripeCustomerId(
  customer: Stripe.Subscription["customer"]
): string | null {
  if (typeof customer === "string") return customer;
  if (customer && typeof customer === "object" && "id" in customer) {
    return customer.id;
  }
  return null;
}

function getSubscriptionPeriodIso(subscription: Stripe.Subscription) {
  const firstItem = subscription.items?.data[0];
  const periodStartUnix = firstItem?.current_period_start;
  const periodEndUnix = firstItem?.current_period_end;

  return {
    periodStart:
      periodStartUnix != null
        ? new Date(periodStartUnix * 1000).toISOString()
        : null,
    periodEnd:
      periodEndUnix != null
        ? new Date(periodEndUnix * 1000).toISOString()
        : null,
  };
}

async function tryGrantMonthlySubscriptionCredits({
  subscription,
  userId,
  planKey,
  creditsPerMonth,
}: {
  subscription: Stripe.Subscription;
  userId: string;
  planKey: string;
  creditsPerMonth: number;
}) {
  if (subscription.status !== "active" || creditsPerMonth <= 0) return;

  const { periodStart } = getSubscriptionPeriodIso(subscription);
  if (!periodStart) return;

  const { data: existing } = await supabaseAdmin
    .from("user_subscriptions")
    .select("last_credit_grant")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (existing?.last_credit_grant && existing.last_credit_grant >= periodStart) {
    return;
  }

  await grantSubscriptionCredits({
    userId,
    creditsToAdd: creditsPerMonth,
    planKey,
  });

  await supabaseAdmin
    .from("user_subscriptions")
    .update({
      last_credit_grant: periodStart,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function upsertUserSubscription(
  subscription: Stripe.Subscription,
  eventType: string
) {
  const userId = subscription.metadata?.userId;
  const planKey = subscription.metadata?.planKey;
  const parsedMetaCredits = Number.parseInt(
    subscription.metadata?.creditsPerMonth ?? "0",
    10
  );
  const planCredits = planKey
    ? getSubscriptionPlanByKey(planKey)?.creditsPerMonth
    : undefined;
  const creditsPerMonth =
    Number.isFinite(parsedMetaCredits) && parsedMetaCredits > 0
      ? parsedMetaCredits
      : (planCredits ?? 0);

  if (!userId || !planKey) {
    console.error("Subscription missing metadata:", {
      subscriptionId: subscription.id,
      userId,
      planKey,
    });
    return;
  }

  const { periodStart, periodEnd } = getSubscriptionPeriodIso(subscription);
  const stripeCustomerId = resolveStripeCustomerId(subscription.customer);

  const { error: upsertError } = await supabaseAdmin
    .from("user_subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: stripeCustomerId,
        plan_key: planKey,
        status: subscription.status,
        credits_per_month: creditsPerMonth,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" }
    );

  if (upsertError) {
    console.error("user_subscriptions upsert error:", upsertError);
    throw new Error("Subscription upsert failed");
  }

  if (
    eventType === "customer.subscription.created" ||
    eventType === "customer.subscription.updated"
  ) {
    await tryGrantMonthlySubscriptionCredits({
      subscription,
      userId,
      planKey,
      creditsPerMonth,
    });
  }
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

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.metadata?.type === "subscription") {
    await logStripeWebhookEvent({
      eventId: event.id,
      eventType: event.type,
      stripeObjectId: session.id,
    });

    return NextResponse.json({
      received: true,
      subscriptionCheckout: true,
      stripeSessionId: session.id,
    });
  }

  const userId = session.metadata?.userId;
  const packageKey = session.metadata?.packageKey;
  const creditPackage = session.metadata?.creditPackage ?? packageKey;
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

  let creditsToAdd: number | null = null;

  if (creditPackage === "custom") {
    const rawCustomCredits =
      session.metadata?.customCredits ?? session.metadata?.credits;
    const parsed = rawCustomCredits
      ? Number.parseInt(String(rawCustomCredits), 10)
      : NaN;

    if (
      !Number.isFinite(parsed) ||
      Number.isNaN(parsed) ||
      parsed < 100 ||
      parsed > 10000
    ) {
      console.error("Invalid custom credits in metadata:", {
        rawCustomCredits,
        sessionId: stripeSessionId,
      });

      await logStripeWebhookEvent({
        eventId: event.id,
        eventType: event.type,
        stripeObjectId: stripeSessionId,
      });

      return NextResponse.json(
        { error: "Invalid custom credits amount" },
        { status: 400 }
      );
    }

    creditsToAdd = parsed;
  } else {
    const metaCredits = session.metadata?.credits
      ? Number.parseInt(session.metadata.credits, 10)
      : NaN;
    creditsToAdd =
      Number.isFinite(metaCredits) && metaCredits > 0
        ? metaCredits
        : (CREDIT_PACKAGES[packageKey] ?? null);
  }

  if (!creditsToAdd) {
    console.error("Invalid credit package:", {
      packageKey,
      creditPackage,
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
    sourceOverride:
      creditPackage === "custom" ? "stripe_custom_topup" : undefined,
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
}

export async function POST(req: Request) {
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Missing STRIPE_SECRET_KEY"
    ) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }
    throw error;
  }

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

  try {
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertUserSubscription(subscription, event.type);

      await logStripeWebhookEvent({
        eventId: event.id,
        eventType: event.type,
        stripeObjectId: subscription.id,
      });

      return NextResponse.json({ received: true, type: event.type });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const { error } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("Subscription cancel update error:", error);
        throw new Error("Subscription cancel failed");
      }

      await logStripeWebhookEvent({
        eventId: event.id,
        eventType: event.type,
        stripeObjectId: subscription.id,
      });

      return NextResponse.json({ received: true, type: event.type });
    }

    if (event.type === "checkout.session.completed") {
      return await handleCheckoutSessionCompleted(event);
    }

    return NextResponse.json({
      received: true,
      ignored: true,
      type: event.type,
    });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
