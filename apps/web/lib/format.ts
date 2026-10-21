import { WINE_TYPES, type WineType } from './types';

const LABELS: Record<WineType, string> = {
  red: 'Red',
  white: 'White',
  sparkling: 'Sparkling',
  rose: 'Rosé',
  dessert: 'Dessert',
  port: 'Port',
};

export const typeLabel = (type: WineType): string => LABELS[type];

export function parseType(value: string | undefined): WineType | undefined {
  return (WINE_TYPES as readonly string[]).includes(value ?? '') ? (value as WineType) : undefined;
}

export function parsePage(value: string | undefined): number {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function formatRating(avg: number | null, reviews: number | null): string | null {
  if (avg === null) return null;
  const base = avg.toFixed(1);
  return reviews ? `${base} (${reviews.toLocaleString('en-US')} reviews)` : base;
}

export function winesHref(params: { type?: string; country?: string; q?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.type) search.set('type', params.type);
  if (params.country) search.set('country', params.country);
  if (params.q) search.set('q', params.q);
  if (params.page && params.page > 1) search.set('page', String(params.page));
  const qs = search.toString();
  return qs ? `/wines?${qs}` : '/wines';
}
