import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const CREDIT_PACKAGES: Record<string, number> = {
  [process.env.STRIPE_PRICE_ID_STARTER!]: 100,
  [process.env.STRIPE_PRICE_ID_PROFESSIONAL!]: 500,
  [process.env.STRIPE_PRICE_ID_ULTIMATE!]: 2000,
};