import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './config/env';

/** Shared by main.ts and e2e tests so both run the same pipeline. */
export function configureApp(app: INestApplication, config: AppConfig) {
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({ origin: config.corsOrigins });
  const doc = new DocumentBuilder()
    .setTitle('Wine & Food Pairing API')
    .setDescription('Browse wines and find food pairings')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));
}
