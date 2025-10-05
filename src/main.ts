import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import multipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(multipart);

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('tempmesh/api/');

  const config = new DocumentBuilder()
    .setTitle('Tempmesh API')
    .setDescription('API specification for Tempmesh')
    .setVersion('v0.1')
    .setExternalDoc('OpenAPI JSON Format', '/tempmesh/api/docs-json')
    .addServer('https://winkels.com.br')
    .setBasePath('/tempmesh/api')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('docs', app, documentFactory);
  SwaggerModule.setup('tempmesh/api/docs', app, documentFactory());

  await app.listen(process.env.APP_PORT || 3000, '0.0.0.0');
}
bootstrap();
