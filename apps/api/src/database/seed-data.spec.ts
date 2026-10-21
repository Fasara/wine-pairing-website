import { categories, rules, slugify } from './seed-data';
import { WINE_TYPES } from './schema';

describe('seed data', () => {
  const slugs = new Set(categories.map((c) => c.slug));

  it('has unique category slugs and unique food slugs', () => {
    expect(slugs.size).toBe(categories.length);
    const foodSlugs = categories.flatMap((c) => c.foods.map(slugify));
    expect(new Set(foodSlugs).size).toBe(foodSlugs.length);
    expect(categories.every((c) => c.foods.length >= 3)).toBe(true);
  });

  it('covers every wine type with several generic rules', () => {
    for (const type of WINE_TYPES) {
      expect(rules.filter((r) => r.wineType === type && r.grape === null).length).toBeGreaterThanOrEqual(5);
    }
  });

  it('only references known categories with valid strengths and reasons', () => {
    for (const r of rules) {
      expect(slugs.has(r.category)).toBe(true);
      expect(r.strength).toBeGreaterThanOrEqual(1);
      expect(r.strength).toBeLessThanOrEqual(5);
      expect(r.reason.length).toBeGreaterThan(10);
    }
  });

  it('has no duplicate (type, grape, category) rules', () => {
    const keys = rules.map((r) => `${r.wineType}|${r.grape}|${r.category}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('slugifies names', () => {
    expect(slugify('Crème Brûlée & Co.')).toBe('creme-brulee-co');
  });
});
