import { faker } from '@faker-js/faker/.';
import { CreateFeatureDto } from '@/feature/dto';
import request from 'supertest';
import { THttpServer } from '../utils/types';

export const getCreateFeatureMockDto = (): CreateFeatureDto => ({
  title: faker.lorem.sentence(),
  description: faker.lorem.sentence(),
  isPublic: faker.datatype.boolean(),
  process: faker.lorem.sentence(),
});

export const createTestFeature = async (
  httpServer: THttpServer,
  accessToken: string,
  projectId: string,
  createProjectDto?: CreateFeatureDto,
): Promise<any> =>
  (
    await request(httpServer)
      .post(`/projects/${projectId}/features`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createProjectDto ?? getCreateFeatureMockDto())
  ).body.data;
