import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { SyncTokenGuard } from './sync-token.guard';
import { SyncService } from './sync.service';

@ApiTags('sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post()
  @HttpCode(200)
  @UseGuards(SyncTokenGuard)
  @ApiHeader({ name: 'x-sync-token', required: true })
  run() {
    return this.sync.run();
  }
}
