import { Food, Wine } from '../common/mappers';

export interface WinePairing {
  food: Food;
  strength: number;
  reason: string;
}

export interface FoodPairing {
  wine: Wine;
  strength: number;
  reason: string;
}

export interface Candidate<T> {
  item: T;
  strength: number;
  reason: string;
  /** Grape-specific rules win ties against generic ones. */
  specific: boolean;
}

function dedupe<T extends { id: number }>(candidates: Candidate<T>[]): Candidate<T>[] {
  const best = new Map<number, Candidate<T>>();
  for (const c of candidates) {
    const current = best.get(c.item.id);
    if (!current || c.strength > current.strength || (c.strength === current.strength && c.specific && !current.specific)) {
      best.set(c.item.id, c);
    }
  }
  return [...best.values()];
}

/** Foods for a wine: rule strength desc, then food name. */
export function rankWinePairings(candidates: Candidate<Food>[]): WinePairing[] {
  return dedupe(candidates)
    .sort((a, b) => b.strength - a.strength || a.item.name.localeCompare(b.item.name))
    .map((c) => ({ food: c.item, strength: c.strength, reason: c.reason }));
}

/** Wines for a food: rule strength desc, then rating desc (unrated last), then id. */
export function rankFoodPairings(candidates: Candidate<Wine>[], limit: number): FoodPairing[] {
  return dedupe(candidates)
    .sort(
      (a, b) =>
        b.strength - a.strength ||
        (b.item.ratingAverage ?? -1) - (a.item.ratingAverage ?? -1) ||
        a.item.id - b.item.id,
    )
    .slice(0, limit)
    .map((c) => ({ wine: c.item, strength: c.strength, reason: c.reason }));
}
