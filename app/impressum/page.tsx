import Link from "next/link";

export const metadata = {
  title: "Legal Notice · InfluExAI",
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 font-sans text-neutral-300">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-medium text-amber-400 hover:text-amber-300">
          ← Back to home
        </Link>
        <h1 className="mt-8 text-3xl font-black uppercase italic tracking-tighter text-white">
          Legal Notice / Impressum
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-white">Service provider</h2>
            <p className="mt-2">
              InfluExAI — AI Creator Studio
              <br />
              Contact: legal@influexai.com
            </p>
          </section>
          <section>
            <h2 className="font-bold text-white">Responsible for content</h2>
            <p className="mt-2">
              AI Creator Studio operates the InfluExAI platform as a pay-as-you-go
              creative production utility for social media creators and agencies.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-white">Disclaimer</h2>
            <p className="mt-2">
              Generated assets remain subject to applicable platform policies of
              third-party distribution channels (TikTok, Instagram, YouTube, etc.).
              Users are responsible for lawful use of all uploaded reference materials.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
