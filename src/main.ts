import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('tempmesh/api/');

  const config = new DocumentBuilder()
    .setTitle('TempMesh API')
    .setDescription('API specification for TempMesh')
    .setVersion('v0.1')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('docs', app, documentFactory);
  SwaggerModule.setup('tempmesh/api/docs', app, documentFactory());

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
