import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { AllExceptionsFilter } from './exception-filter/exception.filter';
import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const basePath = '/api/v1';
  app.setGlobalPrefix(basePath);
  const configService = app.get(ConfigService);
  app.useGlobalFilters(
    new AllExceptionsFilter(
      new ConsoleLogger(AllExceptionsFilter.name),
      configService,
    ),
  );
  await app.init(); // wait for modules to load
  app.useLogger(await app.resolve(LoggerService));
  await app.listen(8080);
}
bootstrap();
