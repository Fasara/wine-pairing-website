export interface AppConfig {
  databaseUrl: string;
  port: number;
  wineApiBaseUrl: string;
  corsOrigins: string[];
  syncToken: string | undefined;
  syncOnStartup: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
  const port = Number(env.API_PORT ?? 4000);
  return {
    databaseUrl,
    port: Number.isInteger(port) && port > 0 ? port : 4000,
    wineApiBaseUrl: (env.WINE_API_BASE_URL ?? 'https://api.sampleapis.com/wines').replace(/\/+$/, ''),
    corsOrigins: (env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    syncToken: env.SYNC_TOKEN || undefined,
    syncOnStartup: env.SYNC_ON_STARTUP !== 'false',
  };
}
