import { NotFoundException } from '@nestjs/common';
import { mockDb } from '../testing/mock-db';
import { FoodsService } from './foods.service';

const cat = { id: 1, slug: 'red-meat', name: 'Red meat' };
const food = { id: 2, categoryId: 1, slug: 'steak', name: 'Steak' };

describe('FoodsService', () => {
  it('lists categories', async () => {
    expect(await new FoodsService(mockDb([cat]).db).categories()).toEqual([cat]);
  });

  it('lists foods with their category, optionally filtered', async () => {
    const expected = [{ id: 2, slug: 'steak', name: 'Steak', category: cat }];
    const all = mockDb([{ food, category: cat }]);
    expect(await new FoodsService(all.db).list()).toEqual(expected);
    expect(all.calls.some((c) => c.method === 'where')).toBe(false);

    const filtered = mockDb([{ food, category: cat }]);
    expect(await new FoodsService(filtered.db).list('red-meat')).toEqual(expected);
    expect(filtered.calls.some((c) => c.method === 'where')).toBe(true);
  });

  it('finds by slug or throws 404', async () => {
    expect((await new FoodsService(mockDb([{ food, category: cat }]).db).findBySlug('steak')).name).toBe('Steak');
    await expect(new FoodsService(mockDb([]).db).findBySlug('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});
