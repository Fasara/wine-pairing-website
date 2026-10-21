import { FoodsController } from './foods/foods.controller';
import { HealthController } from './health/health.controller';
import { PairingsController } from './pairings/pairings.controller';
import { SyncController } from './sync/sync.controller';
import { WinesController } from './wines/wines.controller';

describe('controllers delegate to services', () => {
  it('health', () => expect(new HealthController().check()).toEqual({ status: 'ok' }));

  it('wines', () => {
    const svc: any = { list: jest.fn().mockReturnValue('L'), countries: jest.fn().mockReturnValue('C'), findOne: jest.fn().mockReturnValue('O') };
    const c = new WinesController(svc);
    expect([c.list({ page: 1, pageSize: 12 }), c.countries(), c.findOne(3)]).toEqual(['L', 'C', 'O']);
    expect(svc.findOne).toHaveBeenCalledWith(3);
  });

  it('foods', () => {
    const svc: any = { categories: jest.fn().mockReturnValue('C'), list: jest.fn().mockReturnValue('L'), findBySlug: jest.fn().mockReturnValue('O') };
    const c = new FoodsController(svc);
    expect([c.categories(), c.list('x'), c.findOne('s')]).toEqual(['C', 'L', 'O']);
    c.list('');
    expect(svc.list).toHaveBeenLastCalledWith(undefined);
  });

  it('pairings', () => {
    const svc: any = { foodsForWine: jest.fn().mockReturnValue('F'), winesForFood: jest.fn().mockReturnValue('W') };
    const c = new PairingsController(svc);
    expect([c.foodsForWine(1), c.winesForFood('s')]).toEqual(['F', 'W']);
  });

  it('sync', () => {
    const svc: any = { run: jest.fn().mockReturnValue('R') };
    expect(new SyncController(svc).run()).toBe('R');
  });
});
