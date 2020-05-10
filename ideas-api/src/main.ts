import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import "dotenv/config";
import { Logger } from '@nestjs/common';

const port = process.env.port || 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  Logger.log(`server is running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
