import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FoodsService } from './foods.service';

@ApiTags('foods')
@Controller()
export class FoodsController {
  constructor(private readonly foods: FoodsService) {}

  @Get('food-categories')
  categories() {
    return this.foods.categories();
  }

  @Get('foods')
  @ApiQuery({ name: 'category', required: false, description: 'Food category slug' })
  list(@Query('category') category?: string) {
    return this.foods.list(category || undefined);
  }

  @Get('foods/:slug')
  findOne(@Param('slug') slug: string) {
    return this.foods.findBySlug(slug);
  }
}
