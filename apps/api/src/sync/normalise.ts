import { WineType } from '../database/schema';

/** Wine fields produced from a raw source record, ready to upsert. */
export interface NormalisedWine {
  externalId: string;
  name: string;
  winery: string;
  type: WineType;
  grape: string | null;
  region: string | null;
  country: string | null;
  ratingAverage: number | null;
  ratingReviews: number | null;
  imageUrl: string | null;
}

const TYPE_ALIASES: Record<string, WineType> = {
  red: 'red', reds: 'red',
  white: 'white', whites: 'white',
  sparkling: 'sparkling', champagne: 'sparkling',
  rose: 'rose', rosé: 'rose', roses: 'rose',
  dessert: 'dessert', desserts: 'dessert',
  port: 'port', ports: 'port',
};

export function normaliseType(raw: unknown): WineType | null {
  if (typeof raw !== 'string') return null;
  return TYPE_ALIASES[raw.trim().toLowerCase()] ?? null;
}

/** Keyword (lower-case, matched against name and region) to canonical grape. */
const GRAPE_HINTS: [string, string][] = [
  ['cabernet sauvignon', 'Cabernet Sauvignon'],
  ['merlot', 'Merlot'],
  ['pinot noir', 'Pinot Noir'],
  ['syrah', 'Syrah'],
  ['shiraz', 'Syrah'],
  ['sangiovese', 'Sangiovese'],
  ['chianti', 'Sangiovese'],
  ['brunello', 'Sangiovese'],
  ['nebbiolo', 'Nebbiolo'],
  ['barolo', 'Nebbiolo'],
  ['barbaresco', 'Nebbiolo'],
  ['tempranillo', 'Tempranillo'],
  ['rioja', 'Tempranillo'],
  ['ribera del duero', 'Tempranillo'],
  ['malbec', 'Malbec'],
  ['chardonnay', 'Chardonnay'],
  ['chablis', 'Chardonnay'],
  ['montrachet', 'Chardonnay'],
  ['meursault', 'Chardonnay'],
  ['sauvignon blanc', 'Sauvignon Blanc'],
  ['sancerre', 'Sauvignon Blanc'],
  ['riesling', 'Riesling'],
  ['pinot grigio', 'Pinot Grigio'],
  ['chenin blanc', 'Chenin Blanc'],
  ['vouvray', 'Chenin Blanc'],
];

export function inferGrape(name: string, region: string | null): string | null {
  const haystack = `${name} ${region ?? ''}`.toLowerCase();
  return GRAPE_HINTS.find(([kw]) => haystack.includes(kw))?.[1] ?? null;
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

function parseLocation(raw: unknown): { country: string | null; region: string | null } {
  const parts = typeof raw === 'string' ? raw.split(/[\n·]+/).map((p) => p.trim()).filter(Boolean) : [];
  return { country: parts[0] ?? null, region: parts.length > 1 ? parts.slice(1).join(', ') : null };
}

function parseImage(raw: unknown): string | null {
  const s = str(raw);
  if (!s) return null;
  try {
    const url = new URL(s);
    return url.protocol === 'http:' || url.protocol === 'https:' ? s : null;
  } catch {
    return null;
  }
}

/**
 * Turns one raw SampleAPIs record into a wine. Returns null when the record is
 * unusable (not an object, or missing id, name or winery).
 */
export function normaliseRecord(raw: unknown, type: WineType): NormalisedWine | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;

  const id = typeof rec.id === 'number' || typeof rec.id === 'string' ? String(rec.id).trim() : '';
  const name = str(rec.wine);
  const winery = str(rec.winery);
  if (!id || !name || !winery) return null;

  const rating = rec.rating && typeof rec.rating === 'object' ? (rec.rating as Record<string, unknown>) : {};
  const avg = parseFloat(String(rating.average ?? ''));
  const reviews = parseInt(String(rating.reviews ?? '').replace(/[^\d]/g, ''), 10);
  const { country, region } = parseLocation(rec.location);

  return {
    externalId: `${type}-${id}`,
    name,
    winery,
    type,
    grape: inferGrape(name, region),
    region,
    country,
    ratingAverage: Number.isFinite(avg) && avg >= 0 && avg <= 5 ? avg : null,
    ratingReviews: Number.isFinite(reviews) ? reviews : null,
    imageUrl: parseImage(rec.image),
  };
}
