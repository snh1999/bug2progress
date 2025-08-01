import { HttpStatus, INestApplication } from '@nestjs/common';
import { bootstrapTestServer } from '../utils/bootstrap';
import { THttpServer } from '../utils/types';
import request from 'supertest';
import { PrismaService } from '@/prisma/prisma.service';
import { getAccessToken } from '../helpers/access-token.helper';
import { createTestTicket, getCreateTicketMockDto } from './tickets.test-data';
import { createTestProject } from '../project/project.test-data';
import {
  CreateTicketDto,
  UpdateTicketDto,
  UpdateTicketPositionDto,
} from '@/ticket/dto';
import { createTestFeature } from '../feature/feature.test-data';
import { getTicketExpectedStructure } from './tickets.expected-structure';
import { Ticket, TicketStatus } from '@prisma/client';

describe('App e2e', () => {
  let app: INestApplication;
  let httpServer: THttpServer;
  let dbService: PrismaService;
  let accessToken: string;
  let project: any;
  let feature: any;

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
    project = await createTestProject(httpServer, accessToken);
    feature = await createTestFeature(httpServer, accessToken, project.id);
  });

  describe('TicketController (e2e)', () => {
    describe('POST /projects/:projectId/features/:featureId/tickets', () => {
      let createTicketsDto: CreateTicketDto;

      beforeEach(async () => {
        createTicketsDto = getCreateTicketMockDto();
      });

      it('should successfully create a ticket and return CREATED (201) when request with valid data and auth', async () => {
        const {
          body: { data },
        } = await request(httpServer)
          .post(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createTicketsDto)
          .expect(HttpStatus.CREATED);

        expect(data).toEqual(getTicketExpectedStructure());
        const dbTicket = await dbService.ticket.findUnique({
          where: { id: data.id },
        });
        expect(dbTicket).toBeDefined();
      });

      it('should return NOT_FOUND (404) for invalid feature id and project id combination', async () => {
        const anotherProject = await createTestProject(httpServer, accessToken);
        await request(httpServer)
          .post(`/projects/${anotherProject.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(createTicketsDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .post(`/projects/${project.id}/features/${feature.id}/tickets`)
          .send(createTicketsDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return UNAUTHORIZED (401) with invalid token', async () => {
        await request(httpServer)
          .post(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', 'Bearer invalid-token')
          .send(createTicketsDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return BAD_REQUEST (400) when required fields are missing', async () => {
        const { title: _, ...invalidDtoWithoutTitle } = createTicketsDto;

        await request(httpServer)
          .post(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidDtoWithoutTitle)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('GET /projects/:projectId/features/:featureId/tickets', () => {
      beforeEach(async () => {
        await Promise.all([
          createTestTicket(httpServer, accessToken, project.id, feature.id),
          createTestTicket(httpServer, accessToken, project.id, feature.id),
        ]);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}/features/${feature.id}/tickets`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return OK (200) with tickets when valid auth token is provided', async () => {
        const {
          body: { data },
        } = await request(httpServer)
          .get(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(2);
        expect(data[0]).toEqual(getTicketExpectedStructure());
      });

      it('should return OK (200) with all tickets of the given project id and feature id', async () => {
        const {
          body: { data },
        } = await request(httpServer)
          .get(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(data)).toBe(true);
        data.forEach((ticket: any) => {
          expect(ticket.creatorId).toBe(project.ownerId);
          expect(ticket.projectId).toBe(project.id);
          expect(ticket.featureId).toBe(feature.id);
        });
      });

      it('should return OK (200) with tickets of the feature', async () => {
        const anotherProject = await createTestProject(httpServer, accessToken);
        const anotherFeature = await createTestFeature(
          httpServer,
          accessToken,
          anotherProject.id,
        );
        await createTestTicket(
          httpServer,
          accessToken,
          anotherProject.id,
          anotherFeature.id,
        );

        const {
          body: { data },
        } = await request(httpServer)
          .get(
            `/projects/${anotherProject.id}/features/${anotherFeature.id}/tickets`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(1);
        data.forEach((ticket: any) => {
          expect(ticket.projectId).toBe(anotherProject.id);
          expect(ticket.featureId).toBe(anotherFeature.id);
        });
      });

      it('should return UNAUTHORIZED (401) when invalid token is provided', async () => {
        await request(httpServer)
          .get(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', 'Bearer invalid-token')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return OK (200) with empty array when non project member tries to access', async () => {
        const anotherAccessToken = await getAccessToken(httpServer);
        await request(httpServer)
          .get(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${anotherAccessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => expect(data.length).toBe(0));
      });

      it('should return OK (200) with empty array when feature does not exist(invalid id)', async () => {
        const nonExistentId = '00000000-0000-0000-0000';
        await request(httpServer)
          .get(`/projects/${project.id}/features/${nonExistentId}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => expect(data.length).toBe(0));
      });

      it('should return OK (200) satisfying the query', async () => {
        const newProject = await createTestProject(httpServer, accessToken);
        const newFeature = await createTestFeature(
          httpServer,
          accessToken,
          newProject.id,
        );
        const ticket = await createTestTicket(
          httpServer,
          accessToken,
          newProject.id,
          newFeature.id,
        );
        const query = `creatorId=${ticket.creatorId}`;

        const res = await request(httpServer)
          .get(
            `/projects/${project.id}/features/${feature.id}/tickets?${query}`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(res.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              creatorId: ticket.creatorId,
            }),
          ]),
        );
      });
    });

    describe('PATCH /projects/:id/features/:id/tickets', () => {
      let updateTicketsDto: UpdateTicketPositionDto;

      beforeEach(async () => {
        const data = await Promise.all([
          createTestTicket(httpServer, accessToken, project.id, feature.id),
          createTestTicket(httpServer, accessToken, project.id, feature.id),
          createTestTicket(httpServer, accessToken, project.id, feature.id),
        ]);

        updateTicketsDto = { data: [] };
        data.forEach((ticket) => {
          updateTicketsDto.data.push({
            id: ticket.id,
            position: Math.floor(Math.random()) * 10,
            ticketStatus: TicketStatus.TODO,
          });
        });
      });

      it('should return OK (200) and successfully update a feature', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateTicketsDto)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            data.forEach((ticket: Ticket, index: number) => {
              expect(ticket).toEqual(getTicketExpectedStructure());
              expect(ticket.ticketStatus).toBe(
                updateTicketsDto.data[index].ticketStatus,
              );
              expect(ticket.position).toBe(
                updateTicketsDto.data[index].position,
              );
            });
          });

        updateTicketsDto.data.forEach(async (ticket) => {
          const dbTicket = await dbService.ticket.findUnique({
            where: { id: ticket.id },
          });
          expect(ticket.position).toBe(dbTicket?.position);
          expect(ticket.ticketStatus).toBe(dbTicket?.ticketStatus);
        });
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/features/${feature.id}/tickets`)
          .send(updateTicketsDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return NOT_FOUND (404) when non project member tries to access', async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        await request(httpServer)
          .patch(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .send(updateTicketsDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return NOT_FOUND (404) for non-existent ticket in the array', async () => {
        updateTicketsDto.data.push({
          id: 'invalid-id',
          position: 0,
          ticketStatus: TicketStatus.IN_PROGRESS,
        });

        await request(httpServer)
          .patch(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateTicketsDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return BAD_REQUEST (400) for invalid update data', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ title: '' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return BAD_REQUEST (400) for invalid update data(empty array)', async () => {
        await request(httpServer)
          .patch(`/projects/${project.id}/features/${feature.id}/tickets`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ data: [] })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('GET /projects/:id', () => {
      let ticket: any;

      beforeEach(async () => {
        ticket = await createTestTicket(
          httpServer,
          accessToken,
          project.id,
          feature.id,
        );
      });

      it('should return OK (200) and a ticket by ID when authenticated', async () => {
        await request(httpServer)
          .get(
            `/projects/${project.id}/features/${feature.id}/tickets/${ticket.id}`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data).toEqual(getTicketExpectedStructure());
            expect(data.id).toBe(ticket.id);
          });
      });

      it('should return NOT_FOUND (404) and a ticket by ID when non member tries to access', async () => {
        const anotherAccessToken = await getAccessToken(httpServer);
        await request(httpServer)
          .get(
            `/projects/${project.id}/features/${feature.id}/tickets/${ticket.id}`,
          )
          .set('Authorization', `Bearer ${anotherAccessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return NOT_FOUND (404) when ticket does not exist(invalid id)', async () => {
        const nonExistentId = '00000000-0000-0000-0000';
        await request(httpServer)
          .get(
            `/projects/${project.id}/features/${feature.id}/tickets/${nonExistentId}`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .get(
            `/projects/${project.id}/features/${feature.id}/tickets/${ticket.id}`,
          )
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return UNAUTHORIZED (401) with invalid token', async () => {
        await request(httpServer)
          .get(
            `/projects/${project.id}/features/${feature.id}/tickets/${ticket.id}`,
          )
          .set('Authorization', 'Bearer invalid-token')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('PATCH /projects/:id/features/:id/tickets/:id', () => {
      let existingTicket: any;
      let updateTicketsDto: UpdateTicketDto;

      beforeEach(async () => {
        existingTicket = await createTestTicket(
          httpServer,
          accessToken,
          project.id,
          feature.id,
        );

        updateTicketsDto = {
          title: 'Updated Project Title',
          description: 'Updated ticket summary',
        };
      });

      it('should return OK (200) and successfully update a feature', async () => {
        await request(httpServer)
          .patch(
            `/projects/${project.id}/features/${feature.id}/tickets/${existingTicket.id}`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateTicketsDto)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data).toEqual(getTicketExpectedStructure());
            expect(data.title).toBe(updateTicketsDto.title);
            expect(data.description).toBe(updateTicketsDto.description);
          });

        expect(
          (
            await dbService.ticket.findUnique({
              where: { id: existingTicket.id },
            })
          )?.title,
        ).toBe(updateTicketsDto.title);
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .patch(
            `/projects/${project.id}/features/${feature.id}/tickets/${existingTicket.id}`,
          )
          .send(updateTicketsDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return NOT_FOUND (404) when non project member tries to access', async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        await request(httpServer)
          .patch(
            `/projects/${project.id}/features/${feature.id}/tickets/${existingTicket.id}`,
          )
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .send(updateTicketsDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return NOT_FOUND (404) for non-existent project', async () => {
        const fakeId = '00000000-0000-0000-0000';
        await request(httpServer)
          .patch(
            `/projects/${project.id}/features/${feature.id}/tickets/${fakeId}`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateTicketsDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return BAD_REQUEST (400) for invalid update data', async () => {
        await request(httpServer)
          .patch(
            `/projects/${project.id}/features/${feature.id}/tickets/${existingTicket.id}`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ title: '' })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('DELETE /projects/:id', () => {
      let existingTicket: any;

      beforeEach(async () => {
        existingTicket = await createTestTicket(
          httpServer,
          accessToken,
          project.id,
          feature.id,
        );
      });

      it('should successfully delete a ticket and return OK (200)', async () => {
        await request(httpServer)
          .delete(
            `/projects/${project.id}/features/${feature.id}/tickets/${existingTicket.id}`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(({ body: { data } }) => {
            expect(data).toEqual({ message: 'delete successful' });
          });

        const ticket = await dbService.ticket.findUnique({
          where: { id: existingTicket.id },
        });
        expect(ticket).toBeNull();
      });

      it('should return UNAUTHORIZED (401) without auth token', async () => {
        await request(httpServer)
          .delete(
            `/projects/${project.id}/features/${feature.id}/tickets/${existingTicket.id}`,
          )
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return NOT_FOUND (404) when non project member tries to delete', async () => {
        const anotherUserToken = await getAccessToken(httpServer);

        await request(httpServer)
          .delete(
            `/projects/${project.id}/features/${feature.id}/tickets/${existingTicket.id}`,
          )
          .set('Authorization', `Bearer ${anotherUserToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return NOT_FOUND (404) for non-existent ticket', async () => {
        await request(httpServer)
          .delete(`/projects/${project.id}/features/${existingTicket.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });
});
