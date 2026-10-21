import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, getBaseUrl } from '@/lib/api';
import { jsonResponse, wine } from '../fixtures';

const mockFetch = (res: Response | Error) => {
  const fn = vi.fn(async (..._args: unknown[]) => {
    if (res instanceof Error) throw res;
    return res.clone();
  });
  vi.stubGlobal('fetch', fn);
  return fn;
};

describe('getBaseUrl', () => {
  // jsdom defines window; hide it so tests run as server code unless a test opts in
  beforeEach(() => vi.stubGlobal('window', undefined));

  it('prefers API_URL on the server', () => {
    vi.stubEnv('API_URL', 'http://api:4000/');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    expect(getBaseUrl()).toBe('http://api:4000');
  });

  it('falls back to NEXT_PUBLIC_API_URL then localhost on the server', () => {
    vi.stubEnv('API_URL', '');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://pub:1');
    expect(getBaseUrl()).toBe('http://pub:1');
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    expect(getBaseUrl()).toBe('http://localhost:4000');
  });

  it('uses NEXT_PUBLIC_API_URL in the browser', () => {
    vi.stubEnv('API_URL', 'http://api:4000');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4000');
    vi.stubGlobal('window', {});
    expect(getBaseUrl()).toBe('http://localhost:4000');
  });
});

describe('api client', () => {
  beforeEach(() => vi.stubGlobal('window', undefined));

  it('builds the wines query and skips empty params', async () => {
    vi.stubEnv('API_URL', 'http://api');
    const fetchFn = mockFetch(jsonResponse({ items: [wine()], total: 1, page: 2, pageSize: 12 }));
    const res = await api.listWines({ type: 'red', country: 'Italy', q: 'bar olo', page: 2, pageSize: 12 });
    expect(res.total).toBe(1);
    expect(fetchFn.mock.calls[0][0]).toBe('http://api/wines?type=red&country=Italy&q=bar+olo&page=2&pageSize=12');

    await api.listWines({ q: '' });
    expect(fetchFn.mock.calls[1][0]).toBe('http://api/wines');
    await api.listWines();
    expect(fetchFn.mock.calls[2][0]).toBe('http://api/wines');
  });

  it.each([
    ['listCountries', () => api.listCountries(), '/wines/countries'],
    ['getWine', () => api.getWine(3), '/wines/3'],
    ['getWinePairings', () => api.getWinePairings('3'), '/wines/3/pairings'],
    ['listFoodCategories', () => api.listFoodCategories(), '/food-categories'],
    ['listFoods', () => api.listFoods(), '/foods'],
    ['listFoods(category)', () => api.listFoods('cheese'), '/foods?category=cheese'],
    ['getFood', () => api.getFood('a b'), '/foods/a%20b'],
    ['getFoodWines', () => api.getFoodWines('cheese'), '/foods/cheese/wines'],
  ])('%s hits the right path', async (_n, call, path) => {
    vi.stubEnv('API_URL', 'http://api');
    const fetchFn = mockFetch(jsonResponse([]));
    await call();
    expect(fetchFn.mock.calls[0][0]).toBe(`http://api${path}`);
  });

  it('throws ApiError with the server message', async () => {
    mockFetch(jsonResponse({ statusCode: 404, message: 'Wine not found', error: 'Not Found' }, 404));
    await expect(api.getWine(1)).rejects.toMatchObject({ name: 'ApiError', status: 404, message: 'Wine not found' });
  });

  it('joins array messages (validation errors)', async () => {
    mockFetch(jsonResponse({ statusCode: 400, message: ['a bad', 'b bad'] }, 400));
    await expect(api.listWines()).rejects.toMatchObject({ status: 400, message: 'a bad, b bad' });
  });

  it('falls back to status text when body is not JSON', async () => {
    mockFetch(new Response('boom', { status: 500, statusText: 'Server Error' }));
    await expect(api.listCountries()).rejects.toMatchObject({ status: 500, message: 'Server Error' });
  });

  it('maps network failures to ApiError status 0', async () => {
    mockFetch(new TypeError('fetch failed'));
    const err = await api.listCountries().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
  });
});
