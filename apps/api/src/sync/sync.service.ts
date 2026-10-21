import { BadGatewayException, Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { APP_CONFIG } from '../config/config.module';
import { AppConfig } from '../config/env';
import { Database, DRIZZLE } from '../database/database.module';
import { wines } from '../database/schema';
import { NormalisedWine, normaliseRecord } from './normalise';
import { WINE_SOURCE, WineSourceClient } from './wine-source.client';

export interface SyncResult {
  fetched: number;
  upserted: number;
}

const BATCH_SIZE = 500;

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SyncService.name);
  private inFlight: Promise<SyncResult> | null = null;

  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(WINE_SOURCE) private readonly source: WineSourceClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  /** Runs a sync in the background on startup; never blocks or fails boot. */
  onApplicationBootstrap() {
    if (!this.config.syncOnStartup) return;
    this.run()
      .then((r) => this.logger.log(`Startup sync done: fetched ${r.fetched}, upserted ${r.upserted}`))
      .catch((err) => this.logger.warn(`Startup sync failed (non-fatal): ${err instanceof Error ? err.message : err}`));
  }

  /** Concurrent callers share one running sync. */
  run(): Promise<SyncResult> {
    this.inFlight ??= this.doRun().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async doRun(): Promise<SyncResult> {
    const { batches, errors } = await this.source.fetchAll();
    if (batches.length === 0) {
      throw new BadGatewayException(`Wine source unavailable: ${errors.join('; ') || 'no data'}`);
    }

    let fetched = 0;
    const byExternalId = new Map<string, NormalisedWine>();
    for (const batch of batches) {
      for (const record of batch.records) {
        fetched++;
        const wine = normaliseRecord(record, batch.type);
        if (wine) byExternalId.set(wine.externalId, wine);
      }
    }
    const valid = [...byExternalId.values()];
    if (valid.length < fetched) {
      this.logger.warn(`Skipped ${fetched - valid.length} invalid or duplicate records`);
    }

    for (let i = 0; i < valid.length; i += BATCH_SIZE) {
      await this.db
        .insert(wines)
        .values(valid.slice(i, i + BATCH_SIZE))
        .onConflictDoUpdate({
          target: wines.externalId,
          set: {
            name: sql`excluded.name`,
            winery: sql`excluded.winery`,
            type: sql`excluded.type`,
            grape: sql`excluded.grape`,
            region: sql`excluded.region`,
            country: sql`excluded.country`,
            ratingAverage: sql`excluded.rating_average`,
            ratingReviews: sql`excluded.rating_reviews`,
            imageUrl: sql`excluded.image_url`,
            updatedAt: sql`now()`,
          },
        });
    }
    return { fetched, upserted: valid.length };
  }
}
