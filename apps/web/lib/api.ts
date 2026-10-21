import type {
  Food,
  FoodCategory,
  FoodPairing,
  Paginated,
  Wine,
  WinePairing,
  WineQuery,
} from './types';

const DEFAULT_URL = 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Server code talks to API_URL (docker network); the browser to NEXT_PUBLIC_API_URL. */
export function getBaseUrl(): string {
  const isServer = typeof window === 'undefined';
  const url = isServer
    ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL;
  return (url || DEFAULT_URL).replace(/\/+$/, '');
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new ApiError(0, 'Could not reach the wine service.');
  }
  if (!res.ok) {
    let message = res.statusText || 'Request failed';
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(', ');
      else if (body.message) message = body.message;
    } catch {
      // body was not JSON; keep the status text
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

export const api = {
  listWines: (query: WineQuery = {}) =>
    request<Paginated<Wine>>(`/wines${buildQuery({ ...query })}`),
  listCountries: () => request<string[]>('/wines/countries'),
  getWine: (id: number | string) => request<Wine>(`/wines/${encodeURIComponent(String(id))}`),
  getWinePairings: (id: number | string) =>
    request<WinePairing[]>(`/wines/${encodeURIComponent(String(id))}/pairings`),
  listFoodCategories: () => request<FoodCategory[]>('/food-categories'),
  listFoods: (category?: string) => request<Food[]>(`/foods${buildQuery({ category })}`),
  getFood: (slug: string) => request<Food>(`/foods/${encodeURIComponent(slug)}`),
  getFoodWines: (slug: string) =>
    request<FoodPairing[]>(`/foods/${encodeURIComponent(slug)}/wines`),
};
