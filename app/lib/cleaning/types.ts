/**
 * InfluExAI · Reinigungs-Marktplatz — Domain-Typen & DB-Interfaces
 * Abo-Modell für Firmen · kostenlose Kundensuche
 */

/** Art der Reinigungsleistung (normalisiert durch Ingest-Agent) */
export type LeistungArt =
  | "fensterreinigung"
  | "bueroreinigung"
  | "haushaltsreinigung"
  | "grundreinigung"
  | "bauendreinigung"
  | "teppichreinigung"
  | "sonstiges";

export type PreisTyp = "stundensatz" | "pauschal";

/** Abo-Stufe der Reinigungsfirma — Premium erhält Ranking-Bonus */
export type FirmaAboTier = "standard" | "premium";

/** Tabelle: cleaning_firms */
export interface CleaningFirma {
  id: string;
  name: string;
  logo_url: string | null;
  /** Haupt-PLZ / Standort der Firma */
  plz: string;
  abo_tier: FirmaAboTier;
  /** Durchschnitt 1.0–5.0 */
  rating_avg: number;
  rating_count: number;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Tabelle: cleaning_services — extrahierte Leistungen pro Firma */
export interface CleaningService {
  id: string;
  firma_id: string;
  leistung_art: LeistungArt;
  preis: number;
  preis_typ: PreisTyp;
  /** PLZ-Gebiet, in dem diese Leistung angeboten wird */
  plz: string;
  /** Original-Freitext aus dem Ingest (optional, intern) */
  raw_ingest_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Join für Suchergebnisse — Firma + passende Leistung */
export interface CleaningSearchResultRow {
  firma: CleaningFirma;
  service: CleaningService;
}

/** Payload vom Ingest-Agent (strukturierte Extraktion) */
export interface CleaningIngestExtract {
  firma_id: string;
  leistung_art: LeistungArt;
  preis: number;
  preis_typ: PreisTyp;
  plz: string;
  /** Confidence 0–1 (simuliert / später vom LLM) */
  confidence?: number;
  /** Nicht persistiert — nur Debug/Review */
  source_text?: string;
}

/** Kunden-Suchanfrage */
export interface CleaningSearchQuery {
  leistung_art: LeistungArt;
  plz: string;
  /** Optional: nur Premium zuerst (UI-Filter, Score bleibt gleich) */
  premium_only?: boolean;
}

/** Einzelnes sortiertes Ergebnis inkl. Score-Aufschlüsselung (Admin/Debug) */
export interface CleaningScoredResult {
  row: CleaningSearchResultRow;
  score: number;
  breakdown: CleaningScoreBreakdown;
}

export interface CleaningScoreBreakdown {
  /** 0–100, normalisiert innerhalb der Trefferliste */
  preisScore: number;
  /** 0–100, aus Sternebewertung */
  bewertungsScore: number;
  /** 0–100 — Premium = 100 (= +30 Punkte im Gesamtscore) */
  aboBonus: number;
  /** Gewichtete Summe */
  gesamtScore: number;
}

/** Insert-Typen (ohne Server-generierte Felder) */
export type CleaningFirmaInsert = Omit<
  CleaningFirma,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type CleaningServiceInsert = Omit<
  CleaningService,
  "id" | "created_at" | "updated_at"
> & { id?: string };

/** Mapping UI-Labels (keine Provider-Namen) */
export const LEISTUNG_ART_LABELS: Record<LeistungArt, { de: string; en: string }> = {
  fensterreinigung: { de: "Fensterreinigung", en: "Window cleaning" },
  bueroreinigung: { de: "Büroreinigung", en: "Office cleaning" },
  haushaltsreinigung: { de: "Haushaltsreinigung", en: "Home cleaning" },
  grundreinigung: { de: "Grundreinigung", en: "Deep cleaning" },
  bauendreinigung: { de: "Bauendreinigung", en: "Post-construction cleaning" },
  teppichreinigung: { de: "Teppichreinigung", en: "Carpet cleaning" },
  sonstiges: { de: "Sonstige Leistung", en: "Other service" },
};
