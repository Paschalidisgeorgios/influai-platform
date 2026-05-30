import { redirect } from "next/navigation";

/** Sends legacy dashboard URLs to the reset home. */
export default function DashboardLegacyRedirect() {
  redirect("/dashboard");
}
