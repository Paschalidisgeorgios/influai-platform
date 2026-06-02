-- InfluExAi Launch Schema — idempotent (CREATE IF NOT EXISTS überall)

CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer NOT NULL DEFAULT 0 CHECK (credits >= 0),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase','usage','refund','subscription_grant','bonus')),
  source text,
  stripe_session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ct_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ct_stripe ON public.credit_transactions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  stripe_object_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  display_name text,
  user_type text DEFAULT 'creator',
  onboarding_completed boolean DEFAULT false,
  onboarding_goal text,
  free_trial_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  plan_key text NOT NULL,
  status text NOT NULL,
  credits_per_month integer NOT NULL DEFAULT 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  last_credit_grant timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_us_user ON public.user_subscriptions(user_id);

CREATE TABLE IF NOT EXISTS public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'processing',
  prompt text,
  final_prompt text,
  image_url text,
  video_url text,
  error_message text,
  credits_used integer DEFAULT 0,
  workflow text,
  provider text,
  model text,
  social_platform text,
  output_format text,
  reference_image_url text,
  source_image_url text,
  is_favorite boolean DEFAULT false,
  character_id uuid,
  creative_score integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  failed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_gen_user_created ON public.generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gen_status ON public.generations(status);

CREATE TABLE IF NOT EXISTS public.style_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  appearance_prompt text,
  style_prompt text,
  mood_direction text,
  brand_direction text,
  negative_direction text,
  creative_tag text,
  cover_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sp_user ON public.style_profiles(user_id);

CREATE TABLE IF NOT EXISTS public.brand_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Brand',
  primary_color text DEFAULT '#000000',
  secondary_color text DEFAULT '#ffffff',
  accent_color text DEFAULT '#d8ad5f',
  tone text DEFAULT 'professional',
  product_style text,
  visual_rules text,
  forbidden_elements text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_credits" ON public.user_credits;
CREATE POLICY "own_credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_transactions" ON public.credit_transactions;
CREATE POLICY "own_transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_generations" ON public.generations;
CREATE POLICY "own_generations" ON public.generations FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.style_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_profiles" ON public.style_profiles;
CREATE POLICY "own_profiles" ON public.style_profiles FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_brand_kits" ON public.brand_kits;
CREATE POLICY "own_brand_kits" ON public.brand_kits FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_profile" ON public.user_profiles;
CREATE POLICY "own_profile" ON public.user_profiles FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_subscriptions" ON public.user_subscriptions;
CREATE POLICY "own_subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- RPC Functions
CREATE OR REPLACE FUNCTION public.consume_user_credits(
  target_user_id uuid, credits_to_consume integer
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_current integer;
BEGIN
  SELECT credits INTO v_current FROM public.user_credits
  WHERE user_id = target_user_id FOR UPDATE;
  IF v_current IS NULL OR v_current < credits_to_consume THEN RETURN false; END IF;
  UPDATE public.user_credits
  SET credits = credits - credits_to_consume, updated_at = NOW()
  WHERE user_id = target_user_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_user_credits(
  target_user_id uuid, credits_to_refund integer
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits, updated_at)
  VALUES (target_user_id, credits_to_refund, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET credits = public.user_credits.credits + EXCLUDED.credits, updated_at = NOW();
END;
$$;
