import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS for allowed origins
  app.enableCors({
    origin: [
      'http://localhost:5173', // Local frontend
      'https://winkels.com.br', // Prod frontend
    ],
    credentials: true,
  });

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
