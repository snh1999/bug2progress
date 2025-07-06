import { HttpStatus, INestApplication } from '@nestjs/common';
import { bootstrapTestServer } from '../utils/bootstrap';
import { THttpServer } from '../utils/types';
import request from 'supertest';
import { PrismaService } from '@/prisma/prisma.service';
import { getAccessToken } from '../helpers/access-token.helper';
import {
  createTestProject,
  getCreateProjectMockDto,
} from './project.test-data';
import { getProjectExpectedStructure } from './project.expected-structure';
import { CreateProjectDto, UpdateProjectDto } from '@/project/dto';

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

  describe('ProjectController (e2e)', () => {
    describe('POST /projects', () => {
      let createProjectDto: CreateProjectDto;

      beforeEach(async () => {
        createProjectDto = getCreateProjectMockDto();
      });
      it('should successfully create a project and return CREATED (201) when request with valid data and auth', async () => {
        const response = await request(httpServer)
          .post('/projects')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createProjectDto)
          .expect(HttpStatus.CREATED)
          .expect(({ body }) =>
            expect(body).toEqual(getProjectExpectedStructure()),
          );

        const dbProject = await dbService.project.findUnique({
          where: { id: response.body.id },
        });
        expect(dbProject).toBeDefined();

        const dbPost = await dbService.post.findUnique({
          where: { id: dbProject?.basePostId },
        });
        expect(dbPost).toBeDefined();
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .post('/projects')
          .send(createProjectDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return UNAUTHORIZED (401) with invalid token', async () => {
        await request(httpServer)
          .post('/projects')
          .set('Authorization', 'Bearer invalid-token')
          .send(createProjectDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return BAD_REQUEST (400) when required fields are missing', async () => {
        const { title: _, ...invalidDtoWithoutTitle } = createProjectDto;

        await request(httpServer)
          .post('/projects')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidDtoWithoutTitle)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return CONFLICT (409) when same dto with slug is used', async () => {
        await request(httpServer)
          .post('/projects')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createProjectDto)
          .expect(HttpStatus.CREATED);

        await request(httpServer)
          .post('/projects')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createProjectDto)
          .expect(HttpStatus.CONFLICT);
      });

      it('should return CREATED (201) when same dto without slug is used', async () => {
        const { slug: _, ...createProjectDtoWithoutSlug } = createProjectDto;
        await request(httpServer)
          .post('/projects')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createProjectDtoWithoutSlug)
          .expect(HttpStatus.CREATED);

        await request(httpServer)
          .post('/projects')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createProjectDtoWithoutSlug)
          .expect(HttpStatus.CREATED);
      });
    });

    describe('GET /projects', () => {
      beforeEach(async () => {
        await Promise.all([
          createTestProject(httpServer, accessToken),
          createTestProject(httpServer, accessToken),
        ]);
      });

      it('should return UNAUTHORIZED (401) and array of all projects without auth token', async () => {
        await request(httpServer)
          .get('/projects')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return OK (200) with projects when valid auth token is provided', async () => {
        const response = await request(httpServer)
          .get('/projects')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
        expect(response.body[0]).toEqual(getProjectExpectedStructure());
      });

      it('should return OK (200) with projects of current user', async () => {
        const allProjects = await dbService.project.findMany();
        const ownerId = allProjects[0].ownerId;

        const response = await request(httpServer)
          .get(`/projects`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((project: any) => {
          expect(project.ownerId).toBe(ownerId);
        });
      });

      it('should return UNAUTHORIZED (401) when invalid token is provided', async () => {
        await request(httpServer)
          .get('/projects')
          .set('Authorization', 'Bearer invalid-token')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('GET /projects/:id', () => {
      let project: any;

      beforeEach(async () => {
        project = await createTestProject(httpServer, accessToken);
      });

      it('should return OK (200) and a project by ID when authenticated', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body).toEqual(getProjectExpectedStructure());
            expect(body.id).toBe(project.id);
          });
      });

      it('should return OK (200) and a project by urlid when authenticated', async () => {
        if (!project.urlid) {
          await dbService.project.update({
            where: { id: project.id },
            data: { urlid: 'test-urlid' },
          });
          project.urlid = 'test-urlid';
        }

        await request(httpServer)
          .get(`/projects/${project.urlid}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body).toEqual(getProjectExpectedStructure());
            expect(body.urlid).toBe(project.urlid);
          });
      });

      it('should return NOT_FOUND (404) when project does not exist(invalid id)', async () => {
        const nonExistentId = '00000000-0000-0000-0000';
        await request(httpServer)
          .get(`/projects/${nonExistentId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return UNAUTHORIZED (401) with invalid token', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}`)
          .set('Authorization', 'Bearer invalid-token')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('PATCH /projects/:id', () => {
      let existingProject: any;
      let updateProjectDto: UpdateProjectDto;

      beforeEach(async () => {
        existingProject = await createTestProject(httpServer, accessToken);

        updateProjectDto = {
          title: 'Updated Project Title',
          summary: 'Updated project summary',
          isPublic: !existingProject.isPublic,
        };
      });

      it('should return OK (200) and successfully update a project', async () => {
        await request(httpServer)
          .patch(`/projects/${existingProject.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateProjectDto)
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body).toEqual(getProjectExpectedStructure());
            expect(body.title).toBe(updateProjectDto.title);
            expect(body.summary).toBe(updateProjectDto.summary);
            expect(body.isPublic).toBe(updateProjectDto.isPublic);
          });

        expect(
          (
            await dbService.project.findUnique({
              where: { id: existingProject.id },
            })
          )?.title,
        ).toBe(updateProjectDto.title);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .patch(`/projects/${existingProject.id}`)
          .send(updateProjectDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should return FORBIDDEN (403) when updating another user's project", async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        await request(httpServer)
          .patch(`/projects/${existingProject.id}`)
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .send(updateProjectDto)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should return NOT_FOUND (404) for non-existent project', async () => {
        const fakeId = '00000000-0000-0000-0000';
        await request(httpServer)
          .patch(`/projects/${fakeId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateProjectDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return BAD_REQUEST (400) for invalid update data', async () => {
        await request(httpServer)
          .patch(`/projects/${existingProject.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ title: '' })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('DELETE /projects/:id', () => {
      let existingProject: any;

      beforeEach(async () => {
        existingProject = await createTestProject(httpServer, accessToken);
      });

      it('should successfully delete a project and return OK (200)', async () => {
        await request(httpServer)
          .delete(`/projects/${existingProject.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body).toEqual({ message: 'delete successful' });
          });

        const project = await dbService.project.findUnique({
          where: { id: existingProject.id },
        });
        expect(project).toBeNull();

        const post = await dbService.post.findUnique({
          where: { id: existingProject.basePostId },
        });
        expect(post).toBeNull();
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .delete(`/projects/${existingProject.id}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should return FORBIDDEN (403) when deleting another user's project", async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        await request(httpServer)
          .delete(`/projects/${existingProject.id}`)
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should return NOT_FOUND (404) for non-existent project', async () => {
        await request(httpServer)
          .delete(`/projects/invalidId`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });
});
