import { HttpStatus, INestApplication } from '@nestjs/common';
import { bootstrapTestServer } from '../utils/bootstrap';
import { THttpServer } from '../utils/types';
import request from 'supertest';
import { PrismaService } from '@/prisma/prisma.service';
import { getAccessToken } from '../helpers/access-token.helper';
import { CreatePostDto, UpdatePostDto } from '@/post/dto';
import { createTestPost, getCreatePostMockDto } from './post.test-data';
import {
  getPostExpectedStructure,
  // getPostWithAuthorInfoExpectedStructure,
} from './post.expected-structure';
import { createTestProject } from '../project/project.test-data';

describe('App e2e', () => {
  let app: INestApplication;
  let httpServer: THttpServer;
  let dbService: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const { appInstance, httpServerInstance, dbServiceInstance } =
      await bootstrapTestServer();
    app = appInstance;
    httpServer = httpServerInstance;
    dbService = dbServiceInstance;
  });

  afterAll(async () => {
    await httpServer.close();
    await app.close();
  });

  beforeEach(async () => {
    await dbService.clearDB();
    accessToken = (await getAccessToken(httpServer)) as string;
  });

  describe('PostController (e2e)', () => {
    let postsCount = 3;
    let authorId: string;
    describe('POST /posts', () => {
      let createPostDto: CreatePostDto;

      beforeAll(async () => {
        createPostDto = getCreatePostMockDto();
      });

      it('should successfully create a project and return CREATED (201) when request with valid data and auth', async () => {
        const response = await request(httpServer)
          .post('/posts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createPostDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body).toEqual(getPostExpectedStructure()),
          );

        const dbPost = await dbService.post.findUnique({
          where: { id: response.body.id },
        });
        expect(dbPost).toBeDefined();
      });

      it('should return with CREATED (201) and auto-generate summary if not provided', async () => {
        const { summary: _, ...dto } = createPostDto;
        await request(httpServer)
          .post('/posts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(dto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body.summary).toBe(
              dto.postContent.substring(0, 100) + '...',
            ),
          );
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .post('/posts')
          .send(getCreatePostMockDto())
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return UNAUTHORIZED (401) with invalid token', async () => {
        await request(httpServer)
          .post('/posts')
          .set('Authorization', 'Bearer invalid-token')
          .send(createPostDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return BAD_REQUEST (400) when required fields are missing', async () => {
        const { title: _, ...invalidDtoWithoutTitle } = createPostDto;

        await request(httpServer)
          .post('/posts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidDtoWithoutTitle)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return BAD_REQUEST (400) for invalid data', async () => {
        await request(httpServer)
          .post('/posts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({})
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return CONFLICT (409) when same dto with slug is used', async () => {
        await request(httpServer)
          .post('/posts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createPostDto)
          .expect(HttpStatus.CREATED);

        await request(httpServer)
          .post('/posts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createPostDto)
          .expect(HttpStatus.CONFLICT);
      });
    });

    describe('GET /posts', () => {
      beforeEach(async () => {
        const posts = await Promise.all(
          Array(postsCount)
            .fill(0)
            .map(() => createTestPost(httpServer, accessToken)),
        );

        authorId = posts[0].authorId;
      });

      it('should return UNAUTHORIZED (401) and array of all projects without auth token', async () => {
        await request(httpServer).get('/posts').expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return UNAUTHORIZED (401) when invalid token is provided', async () => {
        await request(httpServer)
          .get('/posts')
          .set('Authorization', 'Bearer invalid-token')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return OK (200) with posts when valid auth token is provided', async () => {
        const response = await request(httpServer)
          .get('/posts')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);
        authorId;

        expect(response.body).toHaveLength(postsCount);
        response.body.forEach((post: any) => {
          expect(post).toEqual(getPostExpectedStructure());
        });
      });

      it('should return OK (200) with posts filtered by user ID', async () => {
        const username = 'testuser';
        const newPostCount = 2;

        const anotherUser = await dbService.user.create({
          data: {
            email: 'another@user.com',
            password: 'password',
            profile: {
              create: {
                username,
                name: 'Another User',
              },
            },
          },
        });

        await dbService.post.createMany({
          data: Array(newPostCount)
            .fill(0)
            .map(() => ({
              ...getCreatePostMockDto(),
              authorId: anotherUser.id,
            })),
        });

        const response = await request(httpServer)
          .get('/posts')
          .set('Authorization', `Bearer ${accessToken}`)
          .query({ user: anotherUser.id })
          .expect(HttpStatus.OK);

        expect(response.body).toHaveLength(newPostCount);
        response.body.forEach((post: any) => {
          expect(post.authorId).toBe(anotherUser.id);
          expect(post.author.profile.username).toBe(username);
        });
      });
    });

    describe('GET /posts/:id', () => {
      let post: any;

      beforeEach(async () => {
        post = await createTestPost(httpServer, accessToken);
      });

      it('should return OK (200) and a post by ID when authenticated', async () => {
        await request(httpServer)
          .get(`/posts/${post.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body).toEqual(getPostExpectedStructure());
            expect(body.id).toBe(post.id);
          });
      });

      it('should return OK (200) and a post by slug when authenticated', async () => {
        await request(httpServer)
          .get(`/posts/${post.slug}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) => expect(body.id).toBe(post.id));
      });

      it('should return NOT_FOUND (404) when post does not exist(invalid id)', async () => {
        await request(httpServer)
          .get('/posts/nonexistent')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should not return project-associated post', async () => {
        const project = await createTestProject(httpServer, accessToken);

        await request(httpServer)
          .get(`/posts/${project.basePostId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .get(`/posts/${post.id}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return UNAUTHORIZED (401) with invalid token', async () => {
        await request(httpServer)
          .get(`/posts/${post.id}`)
          .set('Authorization', 'Bearer invalid-token')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('PATCH /posts/:id', () => {
      let existingPost: any;
      let updateDto: UpdatePostDto;

      beforeEach(async () => {
        existingPost = await createTestPost(httpServer, accessToken);
        updateDto = {
          title: 'Updated title',
          summary: 'Updated summary',
          postContent: 'Updated content',
        };
      });

      it('should return OK(200) and successfully update a post', async () => {
        await request(httpServer)
          .patch(`/posts/${existingPost.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateDto)
          .expect(HttpStatus.OK)
          .expect(({ body }) =>
            expect(body).toEqual(getPostExpectedStructure()),
          );

        const updatedPost = await dbService.post.findUnique({
          where: { id: existingPost.id },
        });
        expect(updatedPost?.title).toBe(updateDto.title);
      });

      it('should return UNAUTHORIZED(401) when request sent without auth token', async () => {
        await request(httpServer)
          .patch(`/posts/${existingPost.id}`)
          .send(updateDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return NOT_FOUND(404) when request sent by another user', async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        await request(httpServer)
          .patch(`/posts/${existingPost.id}`)
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .send(updateDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return NOT_FOUND(404) for non-existent post (invalid id)', async () => {
        await request(httpServer)
          .patch('/posts/nonexistent')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return BAD_REQUEST (400) for invalid update data', async () => {
        await request(httpServer)
          .patch(`/projects/${existingPost.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ title: '' })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('DELETE /posts/:id', () => {
      let post: any;

      beforeEach(async () => {
        post = await createTestPost(httpServer, accessToken);
      });

      it('should return OK (200) and successfully delete a post', async () => {
        await request(httpServer)
          .delete(`/posts/${post.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body).toEqual({ message: 'Successfully Deleted' });
          });

        const dbPost = await dbService.post.findUnique({
          where: { id: post.id },
        });
        expect(dbPost).toBeNull();
      });

      it('should return UNAUTHORIZED (401) when request sent without auth token', async () => {
        await request(httpServer)
          .delete(`/posts/${post.id}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return NOT_FOUND (404) when request sent by another user', async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        await request(httpServer)
          .delete(`/posts/${post.id}`)
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should not return project-associated post', async () => {
        const project = await createTestProject(httpServer, accessToken);

        await request(httpServer)
          .get(`/posts/${project.basePostId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should not delete project-associated posts', async () => {
        const project = await createTestProject(httpServer, accessToken);

        await request(httpServer)
          .delete(`/posts/${project.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return NOT_FOUND (404) for non-existent project(invalid id)', async () => {
        await request(httpServer)
          .delete('/posts/nonexistent')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });
});
