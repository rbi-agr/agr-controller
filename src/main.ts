import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SentryConfig } from './commons/Sentry';
import * as Sentry from '@sentry/node'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  Sentry.init(SentryConfig)
}
bootstrap();