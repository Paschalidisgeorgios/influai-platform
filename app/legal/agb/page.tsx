export const metadata = { title: "AGB — InfluExAi" };

export default function AgbPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="mb-8 inline-block text-xs text-white/30 hover:text-white/60">
          ← Zurück
        </a>
        <h1 className="mb-8 text-3xl font-bold text-white">Allgemeine Geschäftsbedingungen</h1>
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-400">
          ⚠️ Platzhalter — muss von einem Rechtsanwalt geprüft werden.
        </div>
        <div className="space-y-6 text-sm leading-7 text-white/60">
          <div>
            <h2 className="mb-2 font-semibold text-white">Nutzung und Verantwortung</h2>
            <p>
              Der Nutzer ist vollständig verantwortlich für alle generierten Inhalte und
              deren Verwendung. InfluExAi übernimmt keine Haftung für
              Urheberrechtsverletzungen durch Nutzer-Prompts.
            </p>
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-white">Verbotene Inhalte</h2>
            <p>
              NSFW-Inhalte, Deepfakes realer Personen, Inhalte mit Minderjährigen in
              unangemessenem Kontext und gewaltverherrlichende Inhalte sind verboten und
              werden aktiv geblockt.
            </p>
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-white">Zahlungen</h2>
            <p>
              Zahlungen werden über Stripe abgewickelt. Credits sind nicht rückerstattbar
              außer bei technischen Fehlern auf unserer Seite.
            </p>
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-white">Kommerzielle Nutzung</h2>
            <p>
              Generierte Inhalte dürfen kommerziell genutzt werden. Der Nutzer ist selbst
              verantwortlich für IP-Rechte in seinen Prompts.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
