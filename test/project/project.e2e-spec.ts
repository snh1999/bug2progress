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
import {
  getProjectContributorExpectedStructure,
  getProjectExpectedStructure,
} from './project.expected-structure';
import { CreateProjectDto, UpdateProjectDto } from '@/project/dto';
import { getRegisterDto } from '../auth/auth.test-data';
import { createTestUser } from '../users/users.test-helpers';

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
        const {
          body: { data },
        } = await request(httpServer)
          .post('/projects')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createProjectDto)
          .expect(HttpStatus.CREATED);

        expect(data).toEqual(getProjectExpectedStructure());
        const dbProject = await dbService.project.findUnique({
          where: { id: data.id },
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
        const {
          body: { data },
        } = await request(httpServer)
          .get('/projects')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(2);
        expect(data[0]).toEqual(getProjectExpectedStructure());
      });

      it('should return OK (200) with projects of current user', async () => {
        const allProjects = await dbService.project.findMany();
        const ownerId = allProjects[0].ownerId;

        const {
          body: { data },
        } = await request(httpServer)
          .get(`/projects`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(data)).toBe(true);
        data.forEach((project: any) => {
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
          .expect(({ body: { data } }) => {
            expect(data).toEqual(getProjectExpectedStructure());
            expect(data.id).toBe(project.id);
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
          .expect(({ body: { data } }) => {
            expect(data).toEqual(getProjectExpectedStructure());
            expect(data.urlid).toBe(project.urlid);
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
          .expect(({ body: { data } }) => {
            expect(data).toEqual(getProjectExpectedStructure());
            expect(data.title).toBe(updateProjectDto.title);
            expect(data.summary).toBe(updateProjectDto.summary);
            expect(data.isPublic).toBe(updateProjectDto.isPublic);
          });

        expect(
          (
            await dbService.project.findUnique({
              where: { id: existingProject.id },
            })
          )?.title,
        ).toBe(updateProjectDto.title);
      });

      it('should return OK (200) and successfully update owner', async () => {
        const newUser = await createTestUser(dbService);

        await request(httpServer)
          .patch(`/projects/${existingProject.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ ownerId: newUser.id })
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data).toEqual(getProjectExpectedStructure());
            expect(data.ownerId).toBe(newUser.id);
          });
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
          .expect(({ body: { data } }) => {
            expect(data).toEqual({ message: 'delete successful' });
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

  describe('Project Contributors (e2e)', () => {
    let project: any;
    let contributorData: any;
    let contributorAccessToken: string;
    let contributorUserId: string;

    beforeEach(async () => {
      project = await createTestProject(httpServer, accessToken);

      await createTestProject(httpServer, accessToken);

      contributorData = getRegisterDto();
      contributorAccessToken = await getAccessToken(
        httpServer,
        contributorData,
      );

      contributorUserId = (await dbService.user.findFirst({
        where: {
          profile: {
            username: contributorData.username,
          },
        },
      }))!.id;
    });

    describe('POST /projects/:id/contributors', () => {
      it('should return CREATED (201) and add a contributor', async () => {
        const dto = {
          username: contributorData.username,
          role: 'DEVELOPER',
        };

        await request(httpServer)
          .post(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(dto)
          .expect(HttpStatus.CREATED)
          .expect(({ body: { data } }) =>
            expect(data).toEqual(getProjectContributorExpectedStructure()),
          );

        const contributor = await dbService.projectContributor.findUnique({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: contributorUserId,
            },
          },
        });
        expect(contributor).toBeDefined();

        await request(httpServer)
          .get('/projects')
          .set('Authorization', `Bearer ${contributorAccessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data.length).toBeGreaterThanOrEqual(1);
            expect(data).toEqual(
              expect.arrayContaining([getProjectExpectedStructure()]),
            );
            expect(data[0].id).toBe(project.id);
          });
      });

      it('should return BAD_REQUEST (400) for invalid role', async () => {
        const dto = {
          username: contributorData.username,
          role: 'INVALID_ROLE',
        };

        await request(httpServer)
          .post(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(dto)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .post(`/projects/${project.id}/contributors`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return NOT_FOUND (404) for non-existent user', async () => {
        const dto = {
          username: 'nonexistent',
          role: 'DEVELOPER',
        };

        await request(httpServer)
          .post(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(dto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return BAD_REQUEST (400) when required fields are missing', async () => {
        await request(httpServer)
          .post(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({})
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return NOT_FOUND (404) for non-existent project', async () => {
        const dto = {
          username: contributorData.username,
          role: 'DEVELOPER',
        };

        await request(httpServer)
          .post(`/projects/nonexistent/contributors`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(dto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return FORBIDDEN (403) when non-owner tries to add contributor', async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        const dto = {
          username: contributorData.username,
          role: 'DEVELOPER',
        };

        await request(httpServer)
          .post(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .send(dto)
          .expect(HttpStatus.FORBIDDEN);
      });
    });

    describe('GET /projects/:id/contributors', () => {
      it('should return OK (200) with list of contributors', async () => {
        await dbService.projectContributor.create({
          data: {
            projectId: project.id,
            userId: contributorUserId,
            role: 'DEVELOPER',
          },
        });

        await request(httpServer)
          .get(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThanOrEqual(1);
            expect(data[0]).toHaveProperty('userId');
            expect(data[0]).toHaveProperty('role');
          });
      });

      it('should return OK (200) with filtered contributors by role', async () => {
        const managerData = getRegisterDto();
        await getAccessToken(httpServer, managerData);
        const managerUserId = (await dbService.user.findFirst({
          where: {
            profile: {
              username: managerData.username,
            },
          },
        }))!.id;

        await dbService.projectContributor.createMany({
          data: [
            {
              projectId: project.id,
              userId: contributorUserId,
              role: 'DEVELOPER',
            },
            {
              projectId: project.id,
              userId: managerUserId,
              role: 'MANAGER',
            },
          ],
        });

        await request(httpServer)
          .get(`/projects/${project.id}/contributors?role=MANAGER`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data).toEqual(
              expect.arrayContaining([
                getProjectContributorExpectedStructure(),
              ]),
            );
            expect(data.length).toBe(1);
            expect(data[0].role).toBe('MANAGER');
          });
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}/contributors`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('PATCH /projects/:id/contributors', () => {
      let updateContributorDto: any;

      beforeEach(async () => {
        await dbService.projectContributor.create({
          data: {
            projectId: project.id,
            userId: contributorUserId,
            role: 'DEVELOPER',
          },
        });

        updateContributorDto = {
          username: contributorData.username,
          role: 'MANAGER',
        };
      });

      it('should return OK (200) and update contributor role', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateContributorDto)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) =>
            expect(data).toEqual(getProjectContributorExpectedStructure()),
          );

        const contributor = await dbService.projectContributor.findUnique({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: contributorUserId,
            },
          },
        });
        expect(contributor?.role).toBe(updateContributorDto.role);
      });

      it('should return FORBIDDEN (403) when non-owner tries to update role', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${contributorAccessToken}`)
          .send(updateContributorDto)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should return NOT_FOUND (404) for non-existent contributor', async () => {
        const dto = {
          username: 'nonexistent',
          role: 'MANAGER',
        };

        await request(httpServer)
          .patch(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(dto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/contributors`)
          .send(updateContributorDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return BAD_REQUEST (400) for invalid update data', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/contributors`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({})
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return NOT_FOUND (404) for non-existent project', async () => {
        await request(httpServer)
          .patch('/projects/invalid-id/contributors')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateContributorDto)
          .expect(HttpStatus.NOT_FOUND);
      });
    });

    describe('DELETE /projects/:id/contributors', () => {
      beforeEach(async () => {
        await dbService.projectContributor.create({
          data: {
            projectId: project.id,
            userId: contributorUserId,
            role: 'DEVELOPER',
          },
        });
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .delete(
            `/projects/${project.id}/contributors/${contributorData.username}`,
          )
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return OK (200) and remove contributor', async () => {
        await request(httpServer)
          .delete(
            `/projects/${project.id}/contributors/${contributorData.username}`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data).toEqual({ message: 'Delete successful' });
          });

        const contributor = await dbService.projectContributor.findUnique({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: contributorUserId,
            },
          },
        });
        expect(contributor).toBeNull();
      });

      it('should return FORBIDDEN (403) when non-owner tries to remove contributor', async () => {
        await request(httpServer)
          .delete(
            `/projects/${project.id}/contributors/${contributorData.username}`,
          )
          .set('Authorization', `Bearer ${contributorAccessToken}`)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should return NOT_FOUND (404) for non-existent contributor', async () => {
        await request(httpServer)
          .delete(`/projects/${project.id}/contributors/invalidId`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });
});
