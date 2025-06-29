import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,          
      whitelist: true,          
      forbidNonWhitelisted: true, 
    })
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
