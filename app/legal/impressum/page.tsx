export const metadata = { title: "Impressum — InfluExAi" };

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="mb-8 inline-block text-xs text-white/30 hover:text-white/60">
          ← Zurück
        </a>
        <h1 className="mb-8 text-3xl font-bold text-white">Impressum</h1>
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-400">
          ⚠️ Platzhalter — bitte mit echten Unternehmensdaten ersetzen und von einem
          Rechtsanwalt prüfen lassen.
        </div>
        <div className="space-y-6 text-sm leading-7 text-white/60">
          <div>
            <h2 className="mb-2 font-semibold text-white">Angaben gemäß § 5 TMG</h2>
            <p>[Vollständiger Name / Firmenname]</p>
            <p>[Straße und Hausnummer]</p>
            <p>[PLZ Ort]</p>
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-white">Kontakt</h2>
            <p>E-Mail: [deine@email.com]</p>
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-white">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>[Vollständiger Name, Adresse wie oben]</p>
          </div>
        </div>
      </div>
    </main>
  );
}
