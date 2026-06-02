# InfluExAi — AI Creator Studio

**Idee rein → fertiges Social Media Asset Pack raus.**

InfluExAi ist ein AI Creator Studio das aus einer Idee automatisch
ein komplettes, postfertiges Social Media Bundle erstellt:
Bilder · Video · Creative Score · Hooks · Captions · Export

## Stack
- Next.js 16 (App Router) · TypeScript
- Supabase (Auth, DB, Storage)
- Stripe (Payments, Subscriptions)
- Krea AI + Fal AI (Generation)
- Tailwind CSS · Framer Motion

## Setup
npm install
cp .env.example .env.local
npm run dev

## Stripe Webhook lokal testen
stripe listen --forward-to localhost:3000/api/stripe/webhook

## Wichtig
- Niemals .env.local committen
- _archived/ Ordner enthält alte nicht relevante Dateien
