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
    return NextResponse.json({ received: true, ignored: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const eventId = event.id;
  const eventType = event.type;
  const objectId = session.id;

  const { error: insertError } = await supabaseAdmin
    .from("stripe_webhook_events")
    .insert({
      id: eventId,
      type: eventType,
      stripe_object_id: objectId,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    console.error("Webhook duplicate protection error:", insertError);

    return NextResponse.json(
      { error: "Webhook event insert failed" },
      { status: 500 }
    );
  }

  const userId = session.metadata?.userId;
  const packageKey = session.metadata?.packageKey;

  if (!userId || !packageKey) {
    console.error("Missing Stripe metadata:", {
      userId,
      packageKey,
      sessionId: session.id,
    });

    return NextResponse.json(
      { error: "Missing required metadata" },
      { status: 400 }
    );
  }

  const creditsToAdd = CREDIT_PACKAGES[packageKey];

  if (!creditsToAdd) {
    console.error("Invalid credit package:", packageKey);

    return NextResponse.json(
      { error: "Invalid credit package" },
      { status: 400 }
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError);

    return NextResponse.json(
      { error: "Profile fetch failed" },
      { status: 500 }
    );
  }

  const currentCredits = profile?.credits ?? 0;

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({
      credits: currentCredits + creditsToAdd,
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Credit update error:", updateError);

    return NextResponse.json(
      { error: "Credit update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    received: true,
    credited: true,
    userId,
    creditsAdded: creditsToAdd,
  });
}