import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2026-04-22.dahlia",
  });
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CREDIT_PRODUCTS = {
  starter: {
    credits: 100,
    priceId: process.env.STRIPE_PRICE_STARTER!,
  },
  professional: {
    credits: 500,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
  },
  ultimate: {
    credits: 2000,
    priceId: process.env.STRIPE_PRICE_ULTIMATE!,
  },
} as const;

type PackageKey = keyof typeof CREDIT_PRODUCTS;

export async function POST(req: Request) {
  try {
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

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const packageKey = body.packageKey as PackageKey | undefined;
    const rawCustomCredits = body.customCredits as unknown;

    const originHeader = req.headers.get("x-origin");
    const origin =
      originHeader && originHeader.startsWith("http")
        ? originHeader
        : req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    if (typeof rawCustomCredits === "number" || typeof rawCustomCredits === "string") {
      const customCredits = Number.parseInt(String(rawCustomCredits), 10);

      if (
        !Number.isFinite(customCredits) ||
        Number.isNaN(customCredits) ||
        customCredits < 100 ||
        customCredits > 10000
      ) {
        return NextResponse.json(
          { error: "Invalid custom credits amount" },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              unit_amount: customCredits * 10,
              product_data: {
                name: "InfluExAi Custom Credit Top-Up",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/dashboard?checkout=success`,
        cancel_url: `${origin}/dashboard?checkout=cancelled`,
        metadata: {
          userId: user.id,
          packageKey: "custom",
          creditPackage: "custom",
          credits: String(customCredits),
          customCredits: String(customCredits),
        },
      });

      return NextResponse.json({
        success: true,
        url: session.url,
      });
    }

    if (!packageKey || !(packageKey in CREDIT_PRODUCTS)) {
      return NextResponse.json(
        { error: "Invalid credit package" },
        { status: 400 }
      );
    }

    const selectedPackage = CREDIT_PRODUCTS[packageKey];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: selectedPackage.priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
      metadata: {
        userId: user.id,
        packageKey,
        credits: String(selectedPackage.credits),
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}