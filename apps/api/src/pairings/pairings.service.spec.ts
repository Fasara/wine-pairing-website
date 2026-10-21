import { NotFoundException } from '@nestjs/common';
import { mockDb } from '../testing/mock-db';
import { PairingsService } from './pairings.service';

const cat = { id: 1, slug: 'red-meat', name: 'Red meat' };
const food = (id: number, name: string) => ({ id, categoryId: 1, slug: name.toLowerCase(), name });
const rule = (strength: number, grape: string | null = null, wineType = 'red') => ({ id: 1, wineType, grape, foodCategoryId: 1, strength, reason: `r${strength}` });
const wineRow = (id: number, ratingAverage: number | null, grape: string | null = null) => ({
  id, externalId: `e${id}`, name: `w${id}`, winery: 'x', type: 'red', grape, region: null, country: null, ratingAverage, ratingReviews: null, imageUrl: null,
});
const wineDto = wineRow(1, 4, 'Merlot');

const winesSvc = (found = true) => ({ findOne: jest.fn(async () => { if (!found) throw new NotFoundException(); return wineDto; }) }) as any;
const foodSvc = (found = true) => ({
  findBySlug: jest.fn(async () => { if (!found) throw new NotFoundException(); return { id: 1, slug: 'steak', name: 'Steak', category: cat }; }),
}) as any;

describe('PairingsService.foodsForWine', () => {
  it('ranks foods by strength and keeps the strongest rule per food', async () => {
    const { db } = mockDb([
      { rule: rule(3), food: food(1, 'Burger'), category: cat },
      { rule: rule(5, 'Merlot'), food: food(1, 'Burger'), category: cat },
      { rule: rule(4), food: food(2, 'Steak'), category: cat },
    ]);
    const out = await new PairingsService(db, winesSvc(), foodSvc()).foodsForWine(1);
    expect(out.map((p) => [p.food.name, p.strength])).toEqual([['Burger', 5], ['Steak', 4]]);
    expect(out[0].food.category).toEqual(cat);
  });

  it('handles wines without a grape', async () => {
    const svc = winesSvc();
    svc.findOne.mockResolvedValue({ ...wineDto, grape: null });
    const { db } = mockDb([]);
    expect(await new PairingsService(db, svc, foodSvc()).foodsForWine(1)).toEqual([]);
  });

  it('propagates 404 for unknown wines', async () => {
    await expect(new PairingsService(mockDb().db, winesSvc(false), foodSvc()).foodsForWine(9)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('PairingsService.winesForFood', () => {
  it('merges wines across rules and ranks by strength then rating', async () => {
    const { db } = mockDb(
      [rule(5, null, 'red'), rule(3, 'Merlot', 'red')],
      [wineRow(1, 4.0), wineRow(2, 4.8), wineRow(3, null)],
      [wineRow(1, 4.0, 'Merlot'), wineRow(4, 4.9, 'Merlot')],
    );
    const out = await new PairingsService(db, winesSvc(), foodSvc()).winesForFood('steak');
    expect(out.map((p) => [p.wine.id, p.strength])).toEqual([[2, 5], [1, 5], [3, 5], [4, 3]]);
    expect(out[0].wine).not.toHaveProperty('createdAt');
  });

  it('returns an empty list when there are no rules', async () => {
    const { db } = mockDb([]);
    expect(await new PairingsService(db, winesSvc(), foodSvc()).winesForFood('steak')).toEqual([]);
  });

  it('propagates 404 for unknown foods', async () => {
    await expect(new PairingsService(mockDb().db, winesSvc(), foodSvc(false)).winesForFood('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
