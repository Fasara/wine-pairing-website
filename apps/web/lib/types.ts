export const WINE_TYPES = ['red', 'white', 'sparkling', 'rose', 'dessert', 'port'] as const;
export type WineType = (typeof WINE_TYPES)[number];

export interface Wine {
  id: number;
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

export interface FoodCategory {
  id: number;
  slug: string;
  name: string;
}

export interface Food {
  id: number;
  slug: string;
  name: string;
  category: FoodCategory;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

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

export interface WineQuery {
  type?: WineType;
  country?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}
