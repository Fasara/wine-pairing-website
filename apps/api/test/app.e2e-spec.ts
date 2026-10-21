import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Pool } from 'pg';
import { AppModule } from '../src/app.module';
import { loadConfig } from '../src/config/env';
import { runMigrations } from '../src/database/migrate';
import { seed } from '../src/database/seed';
import { configureApp } from '../src/setup';
import { WINE_SOURCE, WineSourceClient } from '../src/sync/wine-source.client';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL must point at a disposable Postgres database to run e2e tests');
}
process.env.SYNC_TOKEN = 'test-token';
process.env.SYNC_ON_STARTUP = 'false';
process.env.CORS_ORIGIN = 'http://localhost:3000';

const rec = (id: number, wine: string, country: string, region: string, avg: string, extra: object = {}) => ({
  id, wine, winery: `Winery ${id}`, rating: { average: avg, reviews: `${id * 10} ratings` },
  location: `${country}\n·\n${region}`, image: 'https://img.test/x.jpg', ...extra,
});

let fixture: { batches: { type: string; records: unknown[] }[]; errors: string[] };
const source: WineSourceClient = { fetchAll: async () => fixture as any };

const freshFixture = () => ({
  batches: [
    { type: 'red', records: [
      rec(1, 'Barolo Riserva 2010', 'Italy', 'Barolo', '4.7'),
      rec(2, 'Rioja Reserva 2015', 'Spain', 'Rioja', '4.2'),
      rec(3, 'Napa Cabernet Sauvignon 2018', 'USA', 'Napa', '4.5'),
      { id: 99, winery: 'No name' },
      null,
    ] },
    { type: 'white', records: [rec(1, 'Chablis Premier Cru', 'France', 'Chablis', '4.4'), rec(2, 'Plain White', 'France', 'Loire', '3.9')] },
    { type: 'sparkling', records: [rec(1, 'Brut Champagne', 'France', 'Champagne', '4.6')] },
    { type: 'rose', records: [rec(1, 'Provence Rose', 'France', 'Provence', '4.1')] },
    { type: 'dessert', records: [rec(1, 'Sauternes', 'France', 'Bordeaux', '4.8')] },
    { type: 'port', records: [rec(1, 'Tawny Port 20', 'Portugal', 'Douro', '4.3')] },
  ],
  errors: [],
});

describe('API (e2e, real Postgres)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  const pool = new Pool({ connectionString: DATABASE_URL });

  beforeAll(async () => {
    await pool.query('drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;');
    await runMigrations(pool);
    await seed(pool);
    await seed(pool); // seeding must be idempotent

    fixture = freshFixture();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(WINE_SOURCE)
      .useValue(source)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app, loadConfig());
    await app.init();
    http = request(app.getHttpServer());
    await http.post('/sync').set('x-sync-token', 'test-token').expect(200);
  });

  afterAll(async () => {
    await app?.close();
    await pool.end();
  });

  describe('health and docs', () => {
    it('GET /health', async () => {
      await http.get('/health').expect(200, { status: 'ok' });
    });
    it('serves swagger at /docs', async () => {
      const res = await http.get('/docs').expect(200);
      expect(res.text).toContain('swagger');
    });
    it('sets CORS for the configured origin', async () => {
      const res = await http.get('/health').set('Origin', 'http://localhost:3000').expect(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('sync', () => {
    it('rejects missing and wrong tokens with 401', async () => {
      await http.post('/sync').expect(401);
      const res = await http.post('/sync').set('x-sync-token', 'nope').expect(401);
      expect(res.body).toMatchObject({ statusCode: 401 });
    });

    it('upserts by external id and is idempotent', async () => {
      const before = await pool.query('select count(*)::int as n from wines');
      const res = await http.post('/sync').set('x-sync-token', 'test-token').expect(200);
      expect(res.body).toEqual({ fetched: 11, upserted: 9 });
      const after = await pool.query('select count(*)::int as n from wines');
      expect(after.rows[0].n).toBe(9);
      expect(after.rows[0].n).toBe(before.rows[0].n);
    });

    it('updates changed records in place', async () => {
      fixture.batches[0].records[0] = rec(1, 'Barolo Riserva 2010', 'Italy', 'Barolo', '4.9');
      await http.post('/sync').set('x-sync-token', 'test-token').expect(200);
      const res = await http.get('/wines?q=barolo').expect(200);
      expect(res.body.items[0].ratingAverage).toBe(4.9);
      fixture = freshFixture();
      await http.post('/sync').set('x-sync-token', 'test-token').expect(200);
    });

    it('returns 502 when the source is unavailable and keeps existing data', async () => {
      const saved = fixture;
      fixture = { batches: [], errors: ['down'] };
      const res = await http.post('/sync').set('x-sync-token', 'test-token').expect(502);
      expect(res.body.statusCode).toBe(502);
      fixture = saved;
      const list = await http.get('/wines').expect(200);
      expect(list.body.total).toBe(9);
    });
  });

  describe('wines', () => {
    it('lists paginated wines sorted by rating', async () => {
      const res = await http.get('/wines').expect(200);
      expect(res.body).toMatchObject({ total: 9, page: 1, pageSize: 12 });
      expect(res.body.items).toHaveLength(9);
      expect(res.body.items[0]).toMatchObject({ name: 'Sauternes', type: 'dessert', country: 'France', region: 'Bordeaux', ratingAverage: 4.8 });
      expect(Object.keys(res.body.items[0]).sort()).toEqual(
        ['country', 'externalId', 'grape', 'id', 'imageUrl', 'name', 'ratingAverage', 'ratingReviews', 'region', 'type', 'winery'],
      );
      const page2 = await http.get('/wines?page=2&pageSize=5').expect(200);
      expect(page2.body.items).toHaveLength(4);
    });

    it('filters by type, country and q (case-insensitive over name/winery/grape)', async () => {
      expect((await http.get('/wines?type=white').expect(200)).body.total).toBe(2);
      expect((await http.get('/wines?country=france').expect(200)).body.total).toBe(5);
      expect((await http.get('/wines?type=red&country=Spain').expect(200)).body.items[0].name).toBe('Rioja Reserva 2015');
      expect((await http.get('/wines?q=CHAMPAGNE').expect(200)).body.total).toBe(1);
      expect((await http.get('/wines?q=winery 2').expect(200)).body.total).toBeGreaterThan(0);
      expect((await http.get('/wines?q=nebbiolo').expect(200)).body.items[0].name).toBe('Barolo Riserva 2010');
      expect((await http.get('/wines?q=100%25').expect(200)).body.total).toBe(0);
    });

    it('treats empty params as absent', async () => {
      const res = await http.get('/wines?type=&country=&q=&page=&pageSize=').expect(200);
      expect(res.body.total).toBe(9);
    });

    it('respects pageSize', async () => {
      const res = await http.get('/wines?pageSize=5&page=2').expect(200);
      expect(res.body.items).toHaveLength(4);
      expect(res.body.pageSize).toBe(5);
    });

    it.each(['type=orange', 'page=0', 'page=abc', 'pageSize=51', 'pageSize=0', 'pageSize=1.5'])('400 for invalid %s', async (qs) => {
      const res = await http.get(`/wines?${qs}`).expect(400);
      expect(res.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
    });

    it('GET /wines/countries', async () => {
      const res = await http.get('/wines/countries').expect(200);
      expect(res.body).toEqual(['France', 'Italy', 'Portugal', 'Spain', 'USA']);
    });

    it('GET /wines/:id returns a wine or 404/400', async () => {
      const list = await http.get('/wines?q=barolo').expect(200);
      const { id } = list.body.items[0];
      const res = await http.get(`/wines/${id}`).expect(200);
      expect(res.body).toMatchObject({ id, grape: 'Nebbiolo', country: 'Italy', type: 'red', externalId: 'red-1', ratingReviews: 10 });
      const missing = await http.get('/wines/999999').expect(404);
      expect(missing.body).toMatchObject({ statusCode: 404, error: 'Not Found' });
      await http.get('/wines/abc').expect(400);
    });
  });

  describe('foods', () => {
    it('GET /food-categories', async () => {
      const res = await http.get('/food-categories').expect(200);
      expect(res.body.length).toBeGreaterThanOrEqual(15);
      expect(res.body[0]).toEqual({ id: expect.any(Number), slug: expect.any(String), name: expect.any(String) });
    });

    it('GET /foods and filtered by category', async () => {
      const all = await http.get('/foods').expect(200);
      const filtered = await http.get('/foods?category=shellfish').expect(200);
      expect(all.body.length).toBeGreaterThan(filtered.body.length);
      expect(filtered.body.length).toBeGreaterThan(0);
      expect(filtered.body.every((f: any) => f.category.slug === 'shellfish')).toBe(true);
      expect((await http.get('/foods?category=nope').expect(200)).body).toEqual([]);
      expect((await http.get('/foods?category=').expect(200)).body).toHaveLength(all.body.length);
    });

    it('GET /foods/:slug', async () => {
      const res = await http.get('/foods/oysters').expect(200);
      expect(res.body).toMatchObject({ slug: 'oysters', name: 'Oysters', category: { slug: 'shellfish' } });
      await http.get('/foods/unknown-food').expect(404);
    });
  });

  describe('pairings', () => {
    const idOf = async (q: string) => (await http.get(`/wines?q=${q}`).expect(200)).body.items[0].id;

    it('GET /wines/:id/pairings ranks by strength and applies grape-specific rules', async () => {
      const res = await http.get(`/wines/${await idOf('barolo')}/pairings`).expect(200);
      const strengths = res.body.map((p: any) => p.strength);
      expect(strengths).toEqual([...strengths].sort((a, b) => b - a));
      expect(res.body[0]).toMatchObject({ strength: 5, reason: expect.any(String), food: { category: { slug: expect.any(String) } } });
      const game = res.body.find((p: any) => p.food.category.slug === 'game');
      expect(game.strength).toBe(5);
      // generic red rule for vegetarian is 3, Nebbiolo-specific is 4
      expect(res.body.find((p: any) => p.food.category.slug === 'vegetarian').strength).toBe(4);
      // no duplicates
      const ids = res.body.map((p: any) => p.food.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('returns pairings for every wine type', async () => {
      for (const q of ['barolo', 'chablis', 'champagne', 'provence', 'sauternes', 'tawny']) {
        const res = await http.get(`/wines/${await idOf(q)}/pairings`).expect(200);
        expect(res.body.length).toBeGreaterThan(5);
      }
    });

    it('GET /wines/:id/pairings 404 and 400', async () => {
      await http.get('/wines/999999/pairings').expect(404);
      await http.get('/wines/abc/pairings').expect(400);
    });

    it('GET /foods/:slug/wines sorted by strength then rating', async () => {
      const res = await http.get('/foods/grilled-steak/wines').expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      for (let i = 1; i < res.body.length; i++) {
        const a = res.body[i - 1];
        const b = res.body[i];
        expect(a.strength).toBeGreaterThanOrEqual(b.strength);
        if (a.strength === b.strength) expect(a.wine.ratingAverage).toBeGreaterThanOrEqual(b.wine.ratingAverage);
      }
      expect(res.body[0].wine).toMatchObject({ name: expect.any(String), type: expect.any(String) });
      // Cabernet-specific rule (5) reaches the Napa Cabernet; port is weak (2) for red meat
      const napa = res.body.find((p: any) => p.wine.name.includes('Cabernet'));
      expect(napa.strength).toBe(5);
    });

    it('GET /foods/:slug/wines for a dessert food includes sweet wine types', async () => {
      const res = await http.get('/foods/dark-chocolate/wines').expect(200);
      expect(res.body[0].wine.type).toBe('port');
    });

    it('GET /foods/:slug/wines 404', async () => {
      await http.get('/foods/nothing/wines').expect(404);
    });
  });

  it('returns the contract error shape for unknown routes', async () => {
    const res = await http.get('/nope').expect(404);
    expect(res.body).toMatchObject({ statusCode: 404, message: expect.any(String), error: 'Not Found' });
  });
});
