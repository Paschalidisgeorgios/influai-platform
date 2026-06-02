import PricingUiProvider from "@/app/components/billing/PricingUiProvider";
import PricingPageClient from "./PricingPageClient";

export const metadata = {
  title: "Pricing — InfluExAI",
  description:
    "Credits for generation and rendering. Free tools to plan before you create.",
};

export default function PricingPage() {
  return (
    <PricingUiProvider language="en">
      <PricingPageClient />
    </PricingUiProvider>
  );
}
