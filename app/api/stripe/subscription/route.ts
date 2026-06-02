import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import {
  getSubscriptionPlanByKey,
  type SubscriptionPlanKey,
} from "@/lib/subscriptions/plans";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { planKey?: string };
    const planKey = body.planKey as SubscriptionPlanKey | undefined;

    const plan = planKey ? getSubscriptionPlanByKey(planKey) : undefined;
    if (!plan || !plan.stripePriceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const originHeader = req.headers.get("x-origin");
    const origin =
      originHeader && originHeader.startsWith("http")
        ? originHeader
        : (req.headers.get("origin") ??
          process.env.NEXT_PUBLIC_APP_URL ??
          (() => {
            throw new Error("NEXT_PUBLIC_APP_URL is not configured");
          })());

    const { data: existingCustomer } = await supabaseAdmin
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existingCustomer?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .upsert(
          {
            user_id: user.id,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (profileError) {
        console.error("user_profiles upsert error:", profileError);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${origin}/dashboard?subscription=success&plan=${planKey}`,
      cancel_url: `${origin}/dashboard/credits?subscription=cancelled`,
      metadata: {
        userId: user.id,
        planKey: plan.key,
        creditsPerMonth: String(plan.creditsPerMonth),
        type: "subscription",
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planKey: plan.key,
          creditsPerMonth: String(plan.creditsPerMonth),
        },
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
