import { NextRequest, NextResponse } from "next/server";

import Stripe from "stripe";

import { authenticateBearerUser } from "../../../lib/supabase-admin";

const PLANS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_ID_STARTER,
    credits: 50,
  },
  professional: {
    priceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL,
    credits: 150,
  },
  ultimate: {
    priceId: process.env.STRIPE_PRICE_ID_ULTIMATE,
    credits: 300,
  },
} as const;

type PlanKey = keyof typeof PLANS;

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    throw new Error("Stripe is not configured");
  }

  return new Stripe(secret);
}

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } =
      await authenticateBearerUser(req);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError ?? "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const plan =
      typeof body.plan === "string"
        ? body.plan
        : "";

    if (!(plan in PLANS)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const selected = PLANS[plan as PlanKey];

    if (!selected.priceId) {
      return NextResponse.json(
        { error: "Plan price is not configured" },
        { status: 500 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      req.nextUrl.origin;

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: selected.priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/image-generator?payment=success`,
      cancel_url: `${origin}/dashboard/image-generator?payment=cancelled`,
      metadata: {
        user_id: user.id,
        plan,
        credits: String(selected.credits),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Checkout failed";

    console.error("STRIPE CHECKOUT ERROR:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
