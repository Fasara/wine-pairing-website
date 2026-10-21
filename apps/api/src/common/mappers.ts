import { FoodCategoryRow, FoodRow, WineRow, WineType } from '../database/schema';

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

export const toWine = (r: WineRow): Wine => ({
  id: r.id,
  externalId: r.externalId,
  name: r.name,
  winery: r.winery,
  type: r.type,
  grape: r.grape,
  region: r.region,
  country: r.country,
  ratingAverage: r.ratingAverage,
  ratingReviews: r.ratingReviews,
  imageUrl: r.imageUrl,
});

export const toCategory = (r: FoodCategoryRow): FoodCategory => ({ id: r.id, slug: r.slug, name: r.name });

export const toFood = (food: FoodRow, category: FoodCategoryRow): Food => ({
  id: food.id,
  slug: food.slug,
  name: food.name,
  category: toCategory(category),
});
