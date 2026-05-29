import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/** Lazy Stripe client — avoids build-time init when STRIPE_SECRET_KEY is unset. */
export function getLegacyStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export const CREDIT_PACKAGES: Record<string, number> = {
  [process.env.STRIPE_PRICE_ID_STARTER!]: 100,
  [process.env.STRIPE_PRICE_ID_PROFESSIONAL!]: 500,
  [process.env.STRIPE_PRICE_ID_ULTIMATE!]: 2000,
};