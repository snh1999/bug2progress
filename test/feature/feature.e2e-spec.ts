import { HttpStatus, INestApplication } from '@nestjs/common';
import { bootstrapTestServer } from '../utils/bootstrap';
import { THttpServer } from '../utils/types';
import request from 'supertest';
import { PrismaService } from '@/prisma/prisma.service';
import { getAccessToken } from '../helpers/access-token.helper';
import {
  createTestFeature,
  getCreateFeatureMockDto,
} from './feature.test-data';
import { getFeatureExpectedStructure } from './feature.expected-structure';
import { CreateFeatureDto, UpdateFeatureDto } from '@/feature/dto';
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

  describe('FeatureController (e2e)', () => {
    describe('POST /features/:projectId', () => {
      let createFeaturesDto: CreateFeatureDto;
      let project: any;

      beforeEach(async () => {
        createFeaturesDto = getCreateFeatureMockDto();
        project = await createTestProject(httpServer, accessToken);
      });

      it('should successfully create a feature and return CREATED (201) when request with valid data and auth', async () => {
        const {
          body: { data },
        } = await request(httpServer)
          .post(`/projects/${project.id}/features`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createFeaturesDto)
          .expect(HttpStatus.CREATED);

        expect(data).toEqual(getFeatureExpectedStructure());
        const dbFeature = await dbService.features.findUnique({
          where: { id: data.id },
        });
        expect(dbFeature).toBeDefined();
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .post(`/projects/${project.id}/features`)
          .send(createFeaturesDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return UNAUTHORIZED (401) with invalid token', async () => {
        await request(httpServer)
          .post(`/projects/${project.id}/features`)
          .set('Authorization', 'Bearer invalid-token')
          .send(createFeaturesDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return BAD_REQUEST (400) when required fields are missing', async () => {
        const { title: _, ...invalidDtoWithoutTitle } = createFeaturesDto;

        await request(httpServer)
          .post(`/projects/${project.id}/features`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidDtoWithoutTitle)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('GET /projects', () => {
      let project: any;

      beforeEach(async () => {
        project = await createTestProject(httpServer, accessToken);

        await Promise.all([
          createTestFeature(httpServer, accessToken, project.id),
          createTestFeature(httpServer, accessToken, project.id),
        ]);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}/features`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return OK (200) with features when valid auth token is provided', async () => {
        const {
          body: { data },
        } = await request(httpServer)
          .get(`/projects/${project.id}/features`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(2);
        expect(data[0]).toEqual(getFeatureExpectedStructure());
      });

      it('should return OK (200) with all features of the given project id', async () => {
        const {
          body: { data },
        } = await request(httpServer)
          .get(`/projects/${project.id}/features`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(data)).toBe(true);
        data.forEach((feature: any) => {
          expect(feature.ownerId).toBe(project.ownerId);
          expect(feature.projectId).toBe(project.id);
        });
      });

      it('should return OK (200) with feature of the project', async () => {
        const anotherProject = await createTestProject(httpServer, accessToken);
        await createTestFeature(httpServer, accessToken, anotherProject.id);

        const {
          body: { data },
        } = await request(httpServer)
          .get(`/projects/${anotherProject.id}/features`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(1);
        data.forEach((feature: any) => {
          expect(feature.projectId).toEqual(anotherProject.id);
        });
      });

      it('should return UNAUTHORIZED (401) when invalid token is provided', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}/features`)
          .set('Authorization', 'Bearer invalid-token')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('GET /projects/:id', () => {
      let project: any;
      let feature: any;

      beforeEach(async () => {
        project = await createTestProject(httpServer, accessToken);
        feature = await createTestFeature(httpServer, accessToken, project.id);
        await createTestFeature(httpServer, accessToken, project.id);
      });

      it('should return OK (200) and a feature by ID when authenticated', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}/features/${feature.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data).toEqual(getFeatureExpectedStructure());
            expect(data.id).toBe(feature.id);
          });
      });

      it('should return OK (200) and a project by ID when non member tries to access', async () => {
        const anotherAccessToken = await getAccessToken(httpServer);
        await request(httpServer)
          .get(`/projects/${project.id}/features/${feature.id}`)
          .set('Authorization', `Bearer ${anotherAccessToken}`)
          .expect(HttpStatus.OK);
      });

      it('should return NOT_FOUND (404) when feature does not exist(invalid id)', async () => {
        const nonExistentId = '00000000-0000-0000-0000';
        await request(httpServer)
          .get(`/projects/${nonExistentId}/features/${nonExistentId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}/features/${feature.id}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return UNAUTHORIZED (401) with invalid token', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}/features/${feature.id}`)
          .set('Authorization', 'Bearer invalid-token')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('PATCH /projects/:id', () => {
      let project: any;
      let existingFeature: any;
      let updateFeaturesDto: UpdateFeatureDto;

      beforeEach(async () => {
        project = await createTestProject(httpServer, accessToken);
        existingFeature = await createTestFeature(
          httpServer,
          accessToken,
          project.id,
        );

        updateFeaturesDto = {
          title: 'Updated Project Title',
          description: 'Updated project summary',
          isPublic: !existingFeature.isPublic,
        };
      });

      it('should return OK (200) and successfully update a feature', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/features/${existingFeature.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateFeaturesDto)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data).toEqual(getFeatureExpectedStructure());
            expect(data.title).toBe(updateFeaturesDto.title);
            expect(data.description).toBe(updateFeaturesDto.description);
            expect(data.isPublic).toBe(updateFeaturesDto.isPublic);
          });

        expect(
          (
            await dbService.features.findUnique({
              where: { id: existingFeature.id },
            })
          )?.title,
        ).toBe(updateFeaturesDto.title);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/features/${existingFeature.id}`)
          .send(updateFeaturesDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should return NOT_FOUND (404) when updating another user's project", async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        await request(httpServer)
          .patch(`/projects/${project.id}/features/${existingFeature.id}`)
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .send(updateFeaturesDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return NOT_FOUND (404) for non-existent project', async () => {
        const fakeId = '00000000-0000-0000-0000';
        await request(httpServer)
          .patch(`/projects/${project.id}/features/${fakeId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateFeaturesDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return BAD_REQUEST (400) for invalid update data', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/features/${existingFeature.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ title: '' })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('DELETE /projects/:id', () => {
      let project: any;
      let existingFeature: any;

      beforeEach(async () => {
        project = await createTestProject(httpServer, accessToken);
        existingFeature = await createTestFeature(
          httpServer,
          accessToken,
          project.id,
        );
      });

      it('should successfully delete a feature and return OK (200)', async () => {
        await request(httpServer)
          .delete(`/projects/${project.id}/features/${existingFeature.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data).toEqual({ message: 'delete successful' });
          });

        const feature = await dbService.features.findUnique({
          where: { id: existingFeature.id },
        });
        expect(feature).toBeNull();
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .delete(`/projects/${project.id}/features/${existingFeature.id}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should return NOT_FOUND (404) when deleting another user's feature", async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        await request(httpServer)
          .delete(`/projects/${project.id}/features/${existingFeature.id}`)
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return NOT_FOUND (404) for non-existent feature', async () => {
        await request(httpServer)
          .delete(`/projects/invalidId`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });
});
