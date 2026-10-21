import { NotFoundException } from '@nestjs/common';
import { mockDb } from '../testing/mock-db';
import { WinesService } from './wines.service';

const row = { id: 1, externalId: 'red-1', name: 'N', winery: 'W', type: 'red', grape: null, region: null, country: 'Spain', ratingAverage: 4.5, ratingReviews: 10, imageUrl: null, createdAt: new Date(), updatedAt: new Date() };

describe('WinesService', () => {
  it('lists with pagination metadata and strips internal columns', async () => {
    const { db, calls } = mockDb([row], [{ count: 25 }]);
    const out = await new WinesService(db).list({ type: 'red', country: 'Spain', q: '50%_off', page: 2, pageSize: 10 });
    expect(out.total).toBe(25);
    expect(out).toMatchObject({ page: 2, pageSize: 10 });
    expect(out.items[0]).not.toHaveProperty('createdAt');
    expect(calls.find((c) => c.method === 'limit')!.args).toEqual([10]);
    expect(calls.find((c) => c.method === 'offset')!.args).toEqual([10]);
  });

  it('lists without filters', async () => {
    const { db } = mockDb([], [{ count: 0 }]);
    expect(await new WinesService(db).list({ page: 1, pageSize: 12 })).toEqual({ items: [], total: 0, page: 1, pageSize: 12 });
  });

  it('returns countries', async () => {
    const { db } = mockDb([{ country: 'France' }, { country: 'Spain' }]);
    expect(await new WinesService(db).countries()).toEqual(['France', 'Spain']);
  });

  it('finds one wine or throws 404', async () => {
    expect((await new WinesService(mockDb([row]).db).findOne(1)).id).toBe(1);
    await expect(new WinesService(mockDb([]).db).findOne(9)).rejects.toBeInstanceOf(NotFoundException);
  });
});
