import { NestFactory } from '@nestjs/core';
import { ScrapperServiceModule } from './scrapper-service.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ScrapperServiceModule);
  console.log('Microservicio Scraper en ejecucion');
}
bootstrap();