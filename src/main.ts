import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import ratelimit from 'express-rate-limit';
import helmet from 'helmet';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { getAllowedMethods, getCorsConfig } from './common/config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });
  app.enableCors({
    methods: getAllowedMethods(),
    ...getCorsConfig(),
  });

  app.use(helmet());
  app.use(cookieParser());

  app.use(
    ratelimit({
      max: parseInt(process.env.MAX_REQ_HR || '100'),
      windowMs: 60 * 60 * 1000,
      message: 'Too many requests from your network, Please try again later',
    }),
  );
  if (process.env.NODE_ENV === 'local') {
    const config = new DocumentBuilder()
      .setTitle('bug2progress')
      .setDescription('bug2progress API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const documentOptions: SwaggerDocumentOptions = {
      ignoreGlobalPrefix: true,
      operationIdFactory: (_: string, methodKey: string) => methodKey,
    };

    const document = SwaggerModule.createDocument(app, config, documentOptions);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(8080);
}

bootstrap();
