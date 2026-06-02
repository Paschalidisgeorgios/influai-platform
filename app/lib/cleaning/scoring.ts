/**
 * Multi-Faktor-Sortieralgorithmus für Reinigungs-Suche
 *
 * S = (0.3 × Preis-Score) + (0.4 × Bewertungs-Score) + (0.3 × Abo-Bonus)
 *
 * Premium-Abo: Abo-Bonus = 100 → trägt +30 Punkte zum Gesamtscore bei (0.3 × 100).
 */

import type {
  CleaningFirma,
  CleaningScoreBreakdown,
  CleaningScoredResult,
  CleaningSearchResultRow,
} from "./types";

/** Gewichtung laut Produkt-Spezifikation */
export const SCORE_WEIGHTS = {
  preis: 0.3,
  bewertung: 0.4,
  abo: 0.3,
} as const;

/** Premium-Firmen erhalten maximalen Abo-Bonus (→ +30 im Gesamtscore) */
export const PREMIUM_ABO_BONUS = 100;
export const STANDARD_ABO_BONUS = 0;

const MIN_RATING = 1;
const MAX_RATING = 5;

/**
 * Bewertungs-Score: linear 1★ → 0 Punkte, 5★ → 100 Punkte
 */
export function bewertungsScoreFromRating(ratingAvg: number): number {
  const clamped = Math.min(MAX_RATING, Math.max(MIN_RATING, ratingAvg));
  return ((clamped - MIN_RATING) / (MAX_RATING - MIN_RATING)) * 100;
}

/**
 * Abo-Bonus: Premium = 100, Standard = 0
 */
export function aboBonusFromTier(tier: CleaningFirma["abo_tier"]): number {
  return tier === "premium" ? PREMIUM_ABO_BONUS : STANDARD_ABO_BONUS;
}

/**
 * Preis-Score innerhalb einer Trefferliste (0–100).
 * Günstigster Preis = 100, teuerster = 0 (bei nur einem Treffer → 100).
 *
 * Stundensatz und Pauschal werden getrennt verglichen — vor dem Scoring
 * solltest du die Liste nach `preis_typ` filtern oder normalisieren.
 */
export function normalizePreisScores(
  rows: CleaningSearchResultRow[]
): Map<string, number> {
  const scores = new Map<string, number>();
  if (!rows.length) return scores;

  const byTyp = new Map<string, CleaningSearchResultRow[]>();
  for (const row of rows) {
    const key = row.service.preis_typ;
    const list = byTyp.get(key) ?? [];
    list.push(row);
    byTyp.set(key, list);
  }

  for (const group of byTyp.values()) {
    const prices = group.map((r) => r.service.preis);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = max - min;

    for (const row of group) {
      const id = row.service.id;
      if (span === 0) {
        scores.set(id, 100);
      } else {
        const inverted =
          ((max - row.service.preis) / span) * 100;
        scores.set(id, Math.round(inverted * 100) / 100);
      }
    }
  }

  return scores;
}

export function computeScoreBreakdown(
  row: CleaningSearchResultRow,
  preisScore: number
): CleaningScoreBreakdown {
  const bewertungsScore = bewertungsScoreFromRating(row.firma.rating_avg);
  const aboBonus = aboBonusFromTier(row.firma.abo_tier);

  const gesamtScore =
    SCORE_WEIGHTS.preis * preisScore +
    SCORE_WEIGHTS.bewertung * bewertungsScore +
    SCORE_WEIGHTS.abo * aboBonus;

  return {
    preisScore: Math.round(preisScore * 100) / 100,
    bewertungsScore: Math.round(bewertungsScore * 100) / 100,
    aboBonus,
    gesamtScore: Math.round(gesamtScore * 100) / 100,
  };
}

/**
 * Sortiert Treffer absteigend nach Gesamt-Score S.
 */
export function rankCleaningResults(
  rows: CleaningSearchResultRow[]
): CleaningScoredResult[] {
  if (!rows.length) return [];

  const preisScores = normalizePreisScores(rows);

  const scored = rows.map((row) => {
    const preisScore = preisScores.get(row.service.id) ?? 50;
    const breakdown = computeScoreBreakdown(row, preisScore);
    return {
      row,
      score: breakdown.gesamtScore,
      breakdown,
    };
  });

  return scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.row.firma.rating_count !== a.row.firma.rating_count) {
      return b.row.firma.rating_count - a.row.firma.rating_count;
    }
    return a.row.service.preis - b.row.service.preis;
  });
}
