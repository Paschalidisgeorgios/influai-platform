export const metadata = { title: "Datenschutz — InfluExAi" };

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="mb-8 inline-block text-xs text-white/30 hover:text-white/60">
          ← Zurück
        </a>
        <h1 className="mb-8 text-3xl font-bold text-white">Datenschutzerklärung</h1>
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-400">
          ⚠️ Platzhalter — muss von einem Datenschutzbeauftragten geprüft werden.
        </div>
        <div className="space-y-6 text-sm leading-7 text-white/60">
          <div>
            <h2 className="mb-2 font-semibold text-white">Welche Daten wir speichern</h2>
            <p>
              E-Mail-Adresse (für Account), generierte Bilder und Videos (in Supabase
              Storage), Prompts (in Datenbank), Zahlungsdaten (bei Stripe, nicht bei uns).
            </p>
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-white">Drittanbieter</h2>
            <p>
              Krea AI (Bildgenerierung), Fal AI (Bildgenerierung), Stripe (Zahlungen),
              Supabase (Datenbank und Auth), ElevenLabs (Sprachsynthese).
            </p>
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-white">Deine Rechte</h2>
            <p>
              Du kannst jederzeit die Löschung deiner Daten und deines Accounts beantragen.
              Kontakt: [deine@email.com]
            </p>
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-white">Speicherdauer</h2>
            <p>
              Generierungen bis zur Löschung durch den Nutzer. Auth-Daten bis zur
              Account-Löschung.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
