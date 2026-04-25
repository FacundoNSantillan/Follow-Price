import { NestFactory } from '@nestjs/core';
import { ApiCoreModule } from '../src/modules/api-core.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiCoreModule);
  app.enableCors();
  
  await app.listen(3000); 
  console.log('API Core esta corriendo en http://localhost:3000');
}
bootstrap();