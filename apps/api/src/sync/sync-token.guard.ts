import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { APP_CONFIG } from '../config/config.module';
import { AppConfig } from '../config/env';

@Injectable()
export class SyncTokenGuard implements CanActivate {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const header = context.switchToHttp().getRequest().headers['x-sync-token'];
    const expected = this.config.syncToken;
    if (!expected || typeof header !== 'string') throw new UnauthorizedException();
    const a = Buffer.from(header);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException();
    return true;
  }
}
