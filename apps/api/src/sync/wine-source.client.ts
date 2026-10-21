import { Inject, Injectable, Logger } from '@nestjs/common';
import { APP_CONFIG } from '../config/config.module';
import { AppConfig } from '../config/env';
import { WineType } from '../database/schema';

export interface RawWineBatch {
  type: WineType;
  records: unknown[];
}

/** Port for wine data providers, so the SampleAPIs source can be swapped. */
export interface WineSourceClient {
  /** Fetches all batches. Batches that fail are reported in `errors` rather than thrown. */
  fetchAll(): Promise<{ batches: RawWineBatch[]; errors: string[] }>;
}

export const WINE_SOURCE = 'WINE_SOURCE';

const ENDPOINTS: Record<WineType, string> = {
  red: 'reds',
  white: 'whites',
  sparkling: 'sparkling',
  rose: 'rose',
  dessert: 'dessert',
  port: 'port',
};

@Injectable()
export class SampleApisWineSource implements WineSourceClient {
  private readonly logger = new Logger(SampleApisWineSource.name);

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async fetchAll() {
    const batches: RawWineBatch[] = [];
    const errors: string[] = [];
    const types = Object.keys(ENDPOINTS) as WineType[];
    await Promise.all(
      types.map(async (type) => {
        const url = `${this.config.wineApiBaseUrl}/${ENDPOINTS[type]}`;
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const body: unknown = await res.json();
          if (!Array.isArray(body)) throw new Error('response is not an array');
          batches.push({ type, records: body });
        } catch (err) {
          const message = `${url}: ${err instanceof Error ? err.message : String(err)}`;
          this.logger.warn(`Failed to fetch ${message}`);
          errors.push(message);
        }
      }),
    );
    return { batches, errors };
  }
}
