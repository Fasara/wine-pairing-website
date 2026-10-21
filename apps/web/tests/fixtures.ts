import type { Food, FoodPairing, Wine, WinePairing } from '@/lib/types';

export const wine = (over: Partial<Wine> = {}): Wine => ({
  id: 1,
  externalId: 'x1',
  name: 'Barolo Riserva',
  winery: 'Cantina Rossa',
  type: 'red',
  grape: 'Nebbiolo',
  region: 'Piedmont',
  country: 'Italy',
  ratingAverage: 4.4,
  ratingReviews: 1234,
  imageUrl: 'https://img.example/barolo.png',
  ...over,
});

export const food = (over: Partial<Food> = {}): Food => ({
  id: 10,
  slug: 'ribeye-steak',
  name: 'Ribeye steak',
  category: { id: 1, slug: 'red-meat', name: 'Red meat' },
  ...over,
});

export const winePairing = (over: Partial<WinePairing> = {}): WinePairing => ({
  food: food(),
  strength: 5,
  reason: 'Tannins cut through the fat.',
  ...over,
});

export const foodPairing = (over: Partial<FoodPairing> = {}): FoodPairing => ({
  wine: wine(),
  strength: 4,
  reason: 'Structure matches richness.',
  ...over,
});

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
