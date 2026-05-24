"use client";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const plans = [
  {
    name: "Starter",
    credits: 100,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER,
  },
  {
    name: "Professional",
    credits: 500,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL,
  },
  {
    name: "Ultimate",
    credits: 2000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ULTIMATE,
  },
];

export default function PricingCards() {
  async function buyCredits(priceId: string | undefined) {
    if (!priceId) {
      alert("Missing price ID");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("You must be logged in to buy credits.");
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Checkout failed");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className="rounded-2xl border border-white/10 p-6 bg-white/5"
        >
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>

          <p className="mt-2 text-sm text-gray-400">
            {plan.credits} Credits
          </p>

          <button
            onClick={() => buyCredits(plan.priceId)}
            className="mt-6 w-full rounded-xl bg-[#c7a36a] text-black py-3 font-semibold hover:opacity-90 transition"
          >
            Kaufen
          </button>
        </div>
      ))}
    </div>
  );
}