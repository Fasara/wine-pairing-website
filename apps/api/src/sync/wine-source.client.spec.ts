import { loadConfig } from '../config/env';
import { SampleApisWineSource } from './wine-source.client';

const config = loadConfig({ DATABASE_URL: 'x', WINE_API_BASE_URL: 'http://wines.test/api/' });

function mockFetch(handler: (url: string) => Partial<Response> | Promise<Partial<Response>>) {
  return jest.spyOn(global, 'fetch').mockImplementation(((url: string) => Promise.resolve(handler(String(url)))) as any);
}

afterEach(() => jest.restoreAllMocks());

describe('SampleApisWineSource', () => {
  it('fetches every wine type from the configured base url', async () => {
    const spy = mockFetch((url) => ({ ok: true, json: async () => [{ id: 1, url }] }));
    const { batches, errors } = await new SampleApisWineSource(config).fetchAll();

    expect(errors).toEqual([]);
    expect(batches.map((b) => b.type).sort()).toEqual(['dessert', 'port', 'red', 'rose', 'sparkling', 'white']);
    const urls = spy.mock.calls.map((c) => String(c[0])).sort();
    expect(urls).toEqual([
      'http://wines.test/api/dessert', 'http://wines.test/api/port', 'http://wines.test/api/reds',
      'http://wines.test/api/rose', 'http://wines.test/api/sparkling', 'http://wines.test/api/whites',
    ]);
  });

  it('reports failures (http errors, bad bodies, network errors) without throwing', async () => {
    mockFetch((url) => {
      if (url.endsWith('/reds')) return { ok: false, status: 503 };
      if (url.endsWith('/whites')) return { ok: true, json: async () => ({ not: 'an array' }) };
      if (url.endsWith('/port')) throw new Error('ECONNRESET');
      return { ok: true, json: async () => [] };
    });
    const { batches, errors } = await new SampleApisWineSource(config).fetchAll();

    expect(batches.map((b) => b.type).sort()).toEqual(['dessert', 'rose', 'sparkling']);
    expect(errors).toHaveLength(3);
    expect(errors.join('\n')).toContain('HTTP 503');
    expect(errors.join('\n')).toContain('not an array');
    expect(errors.join('\n')).toContain('ECONNRESET');
  });

  it('reports non-Error rejections', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue('boom');
    const { batches, errors } = await new SampleApisWineSource(config).fetchAll();
    expect(batches).toEqual([]);
    expect(errors[0]).toContain('boom');
  });
});
