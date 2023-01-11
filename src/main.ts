import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import ratelimit from 'express-rate-limit';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const xss = require('xss-clean');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(helmet());
  app.use(cookieParser());
  app.use(xss());
  app.use(
    ratelimit({
      max: parseInt(process.env.MAX_REQ_HR),
      windowMs: 60 * 60 * 1000,
      message: 'Too many requests from your network, Please try again later',
    }),
  );
  await app.listen(3000);
}
bootstrap();
