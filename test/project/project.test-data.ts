import { CreateProjectDto } from '@/project/dto';
import { ProjectStatus } from '@prisma/client';
import request from 'supertest';
import { THttpServer } from '../utils/types';
import { faker } from '@faker-js/faker/locale/en';

export const getCreateProjectMockDto = (): CreateProjectDto => ({
  title: faker.lorem.sentence(),
  summary: faker.lorem.sentence(),
  isPublic: faker.datatype.boolean(),
  status: ProjectStatus.ACTIVE,
});

export const createTestProject = async (
  httpServer: THttpServer,
  accessToken: string,
  createProjectDto?: CreateProjectDto,
): Promise<any> =>
  (
    await request(httpServer)
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createProjectDto ?? getCreateProjectMockDto())
  ).body.data;
