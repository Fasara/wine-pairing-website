import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { FoodsModule } from './foods/foods.module';
import { HealthController } from './health/health.controller';
import { PairingsModule } from './pairings/pairings.module';
import { SyncModule } from './sync/sync.module';
import { WinesModule } from './wines/wines.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, WinesModule, FoodsModule, PairingsModule, SyncModule],
  controllers: [HealthController],
})
export class AppModule {}
