import { BadGatewayException } from '@nestjs/common';
import { loadConfig } from '../config/env';
import { mockDb } from '../testing/mock-db';
import { SyncService } from './sync.service';
import { WineSourceClient } from './wine-source.client';

const config = (extra: Record<string, string> = {}) => loadConfig({ DATABASE_URL: 'x', ...extra });
const rec = (id: number, extra: object = {}) => ({ id, wine: `Wine ${id}`, winery: 'W', ...extra });

function build(source: Partial<WineSourceClient>, cfg = config()) {
  const { db, calls } = mockDb(undefined, undefined, undefined);
  return { service: new SyncService(db, source as WineSourceClient, cfg), calls };
}

describe('SyncService', () => {
  it('upserts valid records, skipping bad and duplicate ones', async () => {
    const source = {
      fetchAll: jest.fn().mockResolvedValue({
        batches: [
          { type: 'red', records: [rec(1), rec(2), { bad: true }, null, rec(1, { wine: 'Dup' })] },
          { type: 'white', records: [rec(1)] },
        ],
        errors: ['partial failure'],
      }),
    };
    const { service, calls } = build(source);

    await expect(service.run()).resolves.toEqual({ fetched: 6, upserted: 3 });
    const values = calls.find((c) => c.method === 'values')!.args[0] as any[];
    expect(values.map((v) => v.externalId).sort()).toEqual(['red-1', 'red-2', 'white-1']);
    expect(values.find((v) => v.externalId === 'red-1').name).toBe('Dup');
    expect(calls.some((c) => c.method === 'onConflictDoUpdate')).toBe(true);
  });

  it('inserts in batches of 500', async () => {
    const records = Array.from({ length: 1001 }, (_, i) => rec(i + 1));
    const { service, calls } = build({ fetchAll: async () => ({ batches: [{ type: 'red', records }], errors: [] }) });
    await expect(service.run()).resolves.toEqual({ fetched: 1001, upserted: 1001 });
    expect(calls.filter((c) => c.method === 'values')).toHaveLength(3);
  });

  it('throws 502 when the source returns nothing', async () => {
    const { service } = build({ fetchAll: async () => ({ batches: [], errors: ['down'] }) });
    await expect(service.run()).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('shares one in-flight run between concurrent callers, then allows a new one', async () => {
    const fetchAll = jest.fn().mockResolvedValue({ batches: [{ type: 'red', records: [rec(1)] }], errors: [] });
    const { service } = build({ fetchAll });
    const [a, b] = await Promise.all([service.run(), service.run()]);
    expect(a).toBe(b);
    expect(fetchAll).toHaveBeenCalledTimes(1);
    await service.run();
    expect(fetchAll).toHaveBeenCalledTimes(2);
  });

  describe('startup sync', () => {
    it('runs in the background and swallows failures', async () => {
      const fetchAll = jest.fn().mockRejectedValue(new Error('network down'));
      const { service } = build({ fetchAll });
      expect(() => service.onApplicationBootstrap()).not.toThrow();
      await new Promise((r) => setImmediate(r));
      expect(fetchAll).toHaveBeenCalled();
    });

    it('logs success', async () => {
      const fetchAll = jest.fn().mockResolvedValue({ batches: [{ type: 'red', records: [rec(1)] }], errors: [] });
      const { service } = build({ fetchAll });
      service.onApplicationBootstrap();
      await new Promise((r) => setImmediate(r));
      expect(fetchAll).toHaveBeenCalledTimes(1);
    });

    it('is skipped when SYNC_ON_STARTUP=false', () => {
      const fetchAll = jest.fn();
      build({ fetchAll }, config({ SYNC_ON_STARTUP: 'false' })).service.onApplicationBootstrap();
      expect(fetchAll).not.toHaveBeenCalled();
    });

    it('survives non-Error failures', async () => {
      const fetchAll = jest.fn().mockRejectedValue('str');
      build({ fetchAll }).service.onApplicationBootstrap();
      await new Promise((r) => setImmediate(r));
      expect(fetchAll).toHaveBeenCalled();
    });
  });
});
