/**
 * Prompt Safety Filter — erste Schutzebene vor Provider-Calls.
 * Kein Ersatz für Provider-seitige Filter (Krea/Fal haben eigene).
 */
export type SafetyCheckResult = {
  safe: boolean;
  reason?: string;
  category?:
    | "nsfw"
    | "deepfake"
    | "ip_violation"
    | "minor_protection"
    | "violence";
  userMessage: { en: string; de: string };
};

const NSFW_PATTERNS = [
  /\b(nude|naked|nsfw|pornographic|explicit|genitals|xxx)\b/i,
  /\b(nackt|pornografisch|explizit)\b/i,
];

const MINOR_PROTECTION_PATTERNS = [
  /\b(child|children|minor|kid|teenager|underage)\s+(nude|naked|sexual|romantic)\b/i,
  /\b(kind|kinder|minderjährig|jugendlich)\s+(nackt|sexuell|romantisch)\b/i,
];

const REAL_PERSON_PATTERNS = [
  /\b(taylor swift|elon musk|barack obama|donald trump|kim kardashian|beyoncé|rihanna)\b/i,
];

const VIOLENCE_PATTERNS = [/\b(gore|beheading|torture|mass murder)\b/i];

export function checkPromptSafety(prompt: string): SafetyCheckResult {
  for (const pattern of MINOR_PROTECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        category: "minor_protection",
        reason: "Minor protection",
        userMessage: {
          en: "This prompt cannot be processed. Content involving minors in this context is not permitted.",
          de: "Dieser Prompt kann nicht verarbeitet werden. Inhalte mit Minderjährigen sind nicht erlaubt.",
        },
      };
    }
  }

  for (const pattern of NSFW_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        category: "nsfw",
        reason: "NSFW content",
        userMessage: {
          en: "Explicit or adult content is not permitted on InfluExAi.",
          de: "Explizite Inhalte sind auf InfluExAi nicht erlaubt.",
        },
      };
    }
  }

  for (const pattern of REAL_PERSON_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        category: "deepfake",
        reason: "Real person deepfake risk",
        userMessage: {
          en: "Creating realistic images of real public figures is not permitted.",
          de: "Das Erstellen realistischer Bilder von echten Personen ist nicht erlaubt.",
        },
      };
    }
  }

  for (const pattern of VIOLENCE_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        category: "violence",
        reason: "Violence content",
        userMessage: {
          en: "Content depicting extreme violence is not permitted.",
          de: "Inhalte mit extremer Gewalt sind nicht erlaubt.",
        },
      };
    }
  }

  return { safe: true, userMessage: { en: "", de: "" } };
}
