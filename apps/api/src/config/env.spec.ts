import { loadConfig } from './env';

describe('loadConfig', () => {
  it('requires DATABASE_URL', () => {
    expect(() => loadConfig({})).toThrow('DATABASE_URL');
  });

  it('applies defaults', () => {
    expect(loadConfig({ DATABASE_URL: 'pg://x' })).toEqual({
      databaseUrl: 'pg://x',
      port: 4000,
      wineApiBaseUrl: 'https://api.sampleapis.com/wines',
      corsOrigins: ['http://localhost:3000'],
      syncToken: undefined,
      syncOnStartup: true,
    });
  });

  it('reads overrides, trims urls and splits origins', () => {
    const c = loadConfig({
      DATABASE_URL: 'pg://x', API_PORT: '5000', WINE_API_BASE_URL: 'http://a/b//',
      CORS_ORIGIN: 'http://a.com, http://b.com ,', SYNC_TOKEN: 't', SYNC_ON_STARTUP: 'false',
    });
    expect(c).toMatchObject({ port: 5000, wineApiBaseUrl: 'http://a/b', corsOrigins: ['http://a.com', 'http://b.com'], syncToken: 't', syncOnStartup: false });
  });

  it('falls back to 4000 for an invalid port', () => {
    expect(loadConfig({ DATABASE_URL: 'x', API_PORT: 'abc' }).port).toBe(4000);
  });
});
