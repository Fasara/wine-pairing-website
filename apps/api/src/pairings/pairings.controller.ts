import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PairingsService } from './pairings.service';

@ApiTags('pairings')
@Controller()
export class PairingsController {
  constructor(private readonly pairings: PairingsService) {}

  @Get('wines/:id/pairings')
  foodsForWine(@Param('id', ParseIntPipe) id: number) {
    return this.pairings.foodsForWine(id);
  }

  @Get('foods/:slug/wines')
  winesForFood(@Param('slug') slug: string) {
    return this.pairings.winesForFood(slug);
  }
}
