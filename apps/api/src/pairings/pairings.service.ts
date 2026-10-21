import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { toFood, toWine } from '../common/mappers';
import { Database, DRIZZLE } from '../database/database.module';
import { foodCategories, foods, pairingRules, wines } from '../database/schema';
import { FoodsService } from '../foods/foods.service';
import { WinesService } from '../wines/wines.service';
import { Candidate, FoodPairing, rankFoodPairings, rankWinePairings, WinePairing } from './pairing-ranking';

/** Max wines returned per food, per rule and overall. */
export const FOOD_WINES_LIMIT = 24;

@Injectable()
export class PairingsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly winesService: WinesService,
    private readonly foodsService: FoodsService,
  ) {}

  async foodsForWine(wineId: number): Promise<WinePairing[]> {
    const wine = await this.winesService.findOne(wineId);
    const grapeMatch = wine.grape
      ? or(isNull(pairingRules.grape), sql`lower(${pairingRules.grape}) = lower(${wine.grape})`)
      : isNull(pairingRules.grape);

    const rows = await this.db
      .select({ rule: pairingRules, food: foods, category: foodCategories })
      .from(pairingRules)
      .innerJoin(foodCategories, eq(pairingRules.foodCategoryId, foodCategories.id))
      .innerJoin(foods, eq(foods.categoryId, foodCategories.id))
      .where(and(eq(pairingRules.wineType, wine.type), grapeMatch));

    return rankWinePairings(
      rows.map((r) => ({
        item: toFood(r.food, r.category),
        strength: r.rule.strength,
        reason: r.rule.reason,
        specific: r.rule.grape !== null,
      })),
    );
  }

  async winesForFood(slug: string): Promise<FoodPairing[]> {
    const food = await this.foodsService.findBySlug(slug);
    const rules = await this.db.select().from(pairingRules).where(eq(pairingRules.foodCategoryId, food.category.id));

    const candidates: Candidate<ReturnType<typeof toWine>>[] = [];
    for (const rule of rules) {
      const rows = await this.db
        .select()
        .from(wines)
        .where(
          and(
            eq(wines.type, rule.wineType),
            rule.grape ? sql`lower(${wines.grape}) = lower(${rule.grape})` : undefined,
          ),
        )
        .orderBy(sql`${wines.ratingAverage} desc nulls last`, wines.id)
        .limit(FOOD_WINES_LIMIT);
      for (const row of rows) {
        candidates.push({ item: toWine(row), strength: rule.strength, reason: rule.reason, specific: rule.grape !== null });
      }
    }
    return rankFoodPairings(candidates, FOOD_WINES_LIMIT);
  }
}
