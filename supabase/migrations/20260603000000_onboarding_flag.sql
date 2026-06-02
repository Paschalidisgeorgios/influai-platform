ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS free_trial_used boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_goal text;
