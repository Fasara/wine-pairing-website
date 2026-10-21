import { Module } from '@nestjs/common';
import { FoodsModule } from '../foods/foods.module';
import { WinesModule } from '../wines/wines.module';
import { PairingsController } from './pairings.controller';
import { PairingsService } from './pairings.service';

@Module({
  imports: [WinesModule, FoodsModule],
  controllers: [PairingsController],
  providers: [PairingsService],
})
export class PairingsModule {}
