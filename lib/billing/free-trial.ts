import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const FREE_TRIAL_CREDITS = 50;

export async function hasUsedFreeTrial(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("user_profiles")
    .select("free_trial_used")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.free_trial_used === true;
}

export async function grantFreeTrial(userId: string): Promise<boolean> {
  const alreadyUsed = await hasUsedFreeTrial(userId);
  if (alreadyUsed) return false;

  const { error: creditError } = await supabaseAdmin.rpc("refund_user_credits", {
    target_user_id: userId,
    credits_to_refund: FREE_TRIAL_CREDITS,
  });

  if (creditError) return false;

  await supabaseAdmin.from("user_profiles").upsert(
    {
      user_id: userId,
      free_trial_used: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  await supabaseAdmin.from("credit_transactions").insert({
    user_id: userId,
    amount: FREE_TRIAL_CREDITS,
    type: "bonus",
    source: "free_trial",
  });

  return true;
}
