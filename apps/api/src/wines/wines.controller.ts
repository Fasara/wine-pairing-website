import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListWinesQuery } from './wines.dto';
import { WinesService } from './wines.service';

@ApiTags('wines')
@Controller('wines')
export class WinesController {
  constructor(private readonly wines: WinesService) {}

  @Get()
  list(@Query() query: ListWinesQuery) {
    return this.wines.list(query);
  }

  @Get('countries')
  countries() {
    return this.wines.countries();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wines.findOne(id);
  }
}
