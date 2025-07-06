import { faker } from '@faker-js/faker/.';
import request from 'supertest';
import { THttpServer } from '../utils/types';
import { CreatePostDto, UpdatePostDto } from '@/post/dto';

export const getCreatePostMockDto = (): CreatePostDto => ({
  title: faker.lorem.words(3),
  postContent: faker.lorem.paragraphs(3),
  summary: faker.lorem.sentence(),
  isPublic: faker.datatype.boolean(),
  slug: faker.lorem.slug(),
});

export const getUpdatePostMockDto = (): UpdatePostDto => ({
  title: faker.lorem.words(3),
  postContent: faker.lorem.paragraphs(2),
  summary: faker.lorem.sentence(),
  isPublic: faker.datatype.boolean(),
});

export const createTestPost = async (
  httpServer: THttpServer,
  accessToken: string,
  createPostDto?: CreatePostDto,
): Promise<any> =>
  (
    await request(httpServer)
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createPostDto ?? getCreatePostMockDto())
  ).body;
