import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

export const bootstrapTestServer = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const httpServer = app.getHttpServer();
  await app.init();

  const prismaService = app.get<PrismaService>(PrismaService);

  return {
    appInstance: app,
    httpServerInstance: httpServer,
    dbServiceInstance: prismaService,
  };
};
