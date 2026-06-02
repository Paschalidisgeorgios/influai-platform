/** Trust & commercial-use FAQ — cautious, confidence-building; not legal advice. */

export type TrustFaqItem = { q: string; a: string };

export type TrustCommercialFaqCopy = {
  title: string;
  intro: string;
  notLegalAdvice: string;
  items: readonly TrustFaqItem[];
};

export const TRUST_COMMERCIAL_FAQ = {
  en: {
    title: "Rights, privacy and commercial use",
    intro:
      "Practical guidance for creators, brands and agencies — not legal advice.",
    notLegalAdvice: "This is practical guidance, not legal advice.",
    items: [
      {
        q: "Can I use generated assets commercially?",
        a: "Yes. InfluExAI is built for creator and commercial workflows. You can use generated assets for social content, ads, product visuals and creator campaigns, as long as your prompts, uploads, brands, people and references are used lawfully.",
      },
      {
        q: "Who owns the generated outputs?",
        a: "Your generated assets belong to you. InfluExAI does not claim ownership of the outputs you create with your account. You receive usage rights for your creator and commercial workflows, where legally possible.",
      },
      {
        q: "Are my uploads used for training?",
        a: "No, not automatically. Your uploads are used to create the assets you request. Training workflows such as Brand Kit, Creator Style or Product Model are only started when you explicitly choose them.",
      },
      {
        q: "What about brands, logos and people?",
        a: "Use your own brands, products, logos and people only when you have the required rights or consent. Do not use protected brands, celebrities, private people, voices or likenesses without permission.",
      },
      {
        q: "Are there watermarks?",
        a: "No. Paid exports do not include a visible InfluExAI watermark.",
      },
      {
        q: "Can I delete my outputs?",
        a: "Yes. You can delete generated assets from your Creator Gallery. We remove them from your account and active storage. Backup copies may be retained for a limited period where required for technical or legal compliance.",
      },
    ],
  },
  de: {
    title: "Rechte, Datenschutz und kommerzielle Nutzung",
    intro:
      "Praktische Orientierung für Creator, Brands und Agenturen — keine Rechtsberatung.",
    notLegalAdvice: "Das ist praktische Orientierung, keine Rechtsberatung.",
    items: [
      {
        q: "Kann ich generierte Assets kommerziell nutzen?",
        a: "Ja. InfluExAI ist für Creator- und Commercial-Workflows ausgelegt. Du kannst generierte Assets für Social Content, Ads, Produktvisuals und Creator-Kampagnen nutzen — sofern Prompts, Uploads, Marken, Personen und Referenzen rechtmäßig eingesetzt werden.",
      },
      {
        q: "Wem gehören die generierten Outputs?",
        a: "Deine generierten Assets gehören dir. InfluExAI erhebt keinen Anspruch auf die Outputs, die du mit deinem Account erstellst. Du erhältst Nutzungsrechte für Creator- und Commercial-Workflows, soweit rechtlich möglich.",
      },
      {
        q: "Werden meine Uploads zum Training genutzt?",
        a: "Nein, nicht automatisch. Deine Uploads werden genutzt, um die von dir angeforderten Assets zu erstellen. Trainings-Workflows wie Brand Kit, Creator Style oder Product Model starten nur, wenn du sie explizit auswählst.",
      },
      {
        q: "Was gilt für Marken, Logos und Personen?",
        a: "Nutze eigene Marken, Produkte, Logos und Personen nur mit den erforderlichen Rechten oder Einwilligungen. Verwende keine geschützten Marken, Prominenten, private Personen, Stimmen oder Likenesses ohne Erlaubnis.",
      },
      {
        q: "Gibt es Wasserzeichen?",
        a: "Nein. Bezahlte Exporte enthalten kein sichtbares InfluExAI-Wasserzeichen.",
      },
      {
        q: "Kann ich meine Outputs löschen?",
        a: "Ja. Du kannst generierte Assets in deiner Creator Gallery löschen. Wir entfernen sie aus deinem Account und dem aktiven Speicher. Sicherungskopien können für eine begrenzte Zeit aufbewahrt werden, soweit dies aus technischen oder rechtlichen Gründen erforderlich ist.",
      },
    ],
  },
} as const satisfies Record<"en" | "de", TrustCommercialFaqCopy>;

export function getTrustCommercialFaq(language: "en" | "de"): TrustCommercialFaqCopy {
  return TRUST_COMMERCIAL_FAQ[language];
}
