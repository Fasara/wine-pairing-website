import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { Food, FoodCategory, toCategory, toFood } from '../common/mappers';
import { Database, DRIZZLE } from '../database/database.module';
import { foodCategories, foods } from '../database/schema';

@Injectable()
export class FoodsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async categories(): Promise<FoodCategory[]> {
    const rows = await this.db.select().from(foodCategories).orderBy(asc(foodCategories.name));
    return rows.map(toCategory);
  }

  async list(categorySlug?: string): Promise<Food[]> {
    const query = this.db
      .select({ food: foods, category: foodCategories })
      .from(foods)
      .innerJoin(foodCategories, eq(foods.categoryId, foodCategories.id));
    const rows = await (categorySlug ? query.where(eq(foodCategories.slug, categorySlug)) : query).orderBy(
      asc(foodCategories.name),
      asc(foods.name),
    );
    return rows.map((r) => toFood(r.food, r.category));
  }

  async findBySlug(slug: string): Promise<Food> {
    const [row] = await this.db
      .select({ food: foods, category: foodCategories })
      .from(foods)
      .innerJoin(foodCategories, eq(foods.categoryId, foodCategories.id))
      .where(eq(foods.slug, slug))
      .limit(1);
    if (!row) throw new NotFoundException(`Food ${slug} not found`);
    return toFood(row.food, row.category);
  }
}
