import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · InfluExAI",
};

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 font-sans text-neutral-300">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-medium text-amber-400 hover:text-amber-300">
          ← Back to home
        </Link>
        <h1 className="mt-8 text-3xl font-black uppercase italic tracking-tighter text-white">
          Privacy Policy / Datenschutz
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-white">Data processing</h2>
            <p className="mt-2">
              InfluExAI processes account data, uploaded training assets, scripts, and
              generation outputs solely to deliver the requested creative services.
              Processing occurs on secure, enterprise-grade server infrastructure.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-white">GDPR / DSGVO compliance</h2>
            <p className="mt-2">
              Personal data is handled in accordance with GDPR requirements. Training
              images, uploaded footage, and private scripts are not used to train
              public foundation models. Data retention follows workspace-scoped storage
              policies tied to your authenticated account.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-white">Your rights</h2>
            <p className="mt-2">
              You may request access, correction, or deletion of personal data by
              contacting privacy@influexai.com. Payment data is processed by Stripe
              under their own privacy terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
