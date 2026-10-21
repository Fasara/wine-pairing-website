import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncTokenGuard } from './sync-token.guard';
import { SyncService } from './sync.service';
import { SampleApisWineSource, WINE_SOURCE } from './wine-source.client';

@Module({
  controllers: [SyncController],
  providers: [SyncService, SyncTokenGuard, { provide: WINE_SOURCE, useClass: SampleApisWineSource }],
  exports: [SyncService],
})
export class SyncModule {}
