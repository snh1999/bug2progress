import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { bootstrapTestServer } from '../utils/bootstrap';
import { getAccessToken } from '../helpers/access-token.helper';
import request from 'supertest';
import { connectSocket, waitForSocketEvent } from './websocket.helpers';
import { createTestProject } from '../project/project.test-data';
import { createTestTicket } from '../tickets/tickets.test-data';
import { THttpServer } from '../utils/types';
import {
  FEATURE_CREATION_EVENT,
  FEATURE_DELETION_EVENT,
  FEATURE_UPDATE_EVENT,
  PROJECT_DELETION_EVENT,
  PROJECT_UPDATE_EVENT,
  TICKET_CREATION_EVENT,
  TICKET_DELETION_EVENT,
  TICKET_REARRANGEMENT_EVENT,
  TICKET_UPDATE_EVENT,
} from '@/websocket/events.constant';
import { Socket } from 'socket.io-client';
import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  getCreateFeaturePayloadExpectedStructure,
  getCreateTicketPayloadExpectedStructure,
  getDeleteFeaturePayloadExpectedStructure,
  getDeleteProjectPayloadExpectedStructure,
  getDeleteTicketPayloadExpectedStructure,
  getRearrangeTicketPayloadExpectedStructure,
  getUpdateFeaturePayloadExpectedStructure,
  getUpdateProjectPayloadExpectedStructure,
  getUpdateTicketPayloadExpectedStructure,
} from './websocket.expected-structure';
import {
  TFeatureCreationPayload,
  TFeatureDeletionPayload,
  TProjectDeletionPayload,
  TProjectUpdatePayload,
  TTicketCreationPayload,
  TTicketDeletionPayload,
  TTicketRearrangementPayload,
  TTicketUpdatePayload,
} from '@/websocket/websocket.types';
import { UpdateTicketPositionDto } from '@/ticket/dto';
import { TicketStatus } from '@prisma/client';
import {
  INVALID_TOKEN_MESSAGE,
  NO_TOKEN_MESSAGE,
} from '@/websocket/websocket.constant';
import { createTestFeature } from '../feature/feature.test-data';

describe('Websocket e2e', () => {
  let app: INestApplication;
  let httpServer: THttpServer;
  let dbService: PrismaService;
  let baseUrl: string;
  let user1Token: string;
  let user2Token: string;
  let project: any;

  let user1Socket: Socket;
  let user2Socket: Socket;

  beforeAll(async () => {
    const { appInstance, httpServerInstance, dbServiceInstance } =
      await bootstrapTestServer();
    app = appInstance;
    app.useWebSocketAdapter(new IoAdapter(app));
    dbService = dbServiceInstance;
    httpServer = httpServerInstance;
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));

    const address = httpServerInstance.address();
    const port = typeof address === 'object' ? address.port : address;
    baseUrl = `http://localhost:${port}`;

    user1Token = await getAccessToken(httpServerInstance);
    user2Token = await getAccessToken(httpServerInstance);
  });

  afterAll(async () => {
    await dbService.clearDB();
    await app.close();
  });

  beforeEach(async () => {
    project = await createTestProject(httpServer, user1Token);
    try {
      user1Socket = await connectSocket({
        baseUrl,
        token: user1Token,
        projectId: project.id,
      });

      user2Socket = await connectSocket({
        baseUrl,
        token: user2Token,
        projectId: project.id,
      });
    } catch (error) {
      if (error instanceof Error)
        console.error('Socket connection failed in beforeEach:', error.message);
      user1Socket = null as any;
      user2Socket = null as any;
      throw error;
    }
  });

  afterEach(async () => {
    if (user1Socket?.connected) user1Socket.disconnect();
    if (user2Socket?.connected) user2Socket.disconnect();

    user1Socket?.removeAllListeners();
    user2Socket?.removeAllListeners();
  });

  describe('Socket Authentication check', () => {
    it('should create websocket without token', async () => {
      try {
        await connectSocket({
          baseUrl,
          projectId: project.id,
        });
      } catch (error) {
        if (error instanceof Error)
          expect(error.message).toEqual(NO_TOKEN_MESSAGE);
      }
    });

    it('should create websocket without token', async () =>
      connectSocket({
        baseUrl,
        token: 'invalid_token',
        projectId: project.id,
      }).catch((error) =>
        expect(error.message).toEqual(INVALID_TOKEN_MESSAGE),
      ));
  });

  describe('Project Events', () => {
    it('should trigger event as resoponse of project update', async () => {
      const projectUpdatePromise = waitForSocketEvent(
        user2Socket,
        PROJECT_UPDATE_EVENT,
      );

      const updateProjectDto = {
        title: 'Updated Project Title',
        summary: 'Updated Project summary',
      };

      await request(httpServer)
        .patch(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(updateProjectDto);

      const payload = (await projectUpdatePromise) as TProjectUpdatePayload;
      expect(payload).toEqual(getUpdateProjectPayloadExpectedStructure());
      expect(payload.projectId).toEqual(project.id);
      expect(payload.project.title).toEqual(updateProjectDto.title);
      expect(payload.project.summary).toEqual(updateProjectDto.summary);
    });

    it('should trigger event as resoponse of project delete', async () => {
      const projectDeletionPromise = waitForSocketEvent(
        user2Socket,
        PROJECT_DELETION_EVENT,
      );

      await request(httpServer)
        .delete(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      const payload = (await projectDeletionPromise) as TProjectDeletionPayload;
      expect(payload).toEqual(getDeleteProjectPayloadExpectedStructure());
      expect(payload.projectId).toEqual(project.id);
    });
  });

  describe('Feature Events', () => {
    it('should trigger event as resoponse of feature creation', async () => {
      const featureCreationPromise = waitForSocketEvent(
        user2Socket,
        FEATURE_CREATION_EVENT,
      );

      const feature = await createTestFeature(
        httpServer,
        user1Token,
        project.id,
      );

      const payload = (await featureCreationPromise) as TFeatureCreationPayload;
      expect(payload).toEqual(getCreateFeaturePayloadExpectedStructure());
      expect(payload.feature.id).toEqual(feature.id);
      expect(payload.projectId).toEqual(project.id);
    });

    it('should trigger event as resoponse of feature update', async () => {
      const featureUpdatePromise = waitForSocketEvent(
        user2Socket,
        FEATURE_UPDATE_EVENT,
      );

      const feature = await createTestFeature(
        httpServer,
        user1Token,
        project.id,
      );

      const updateTicketsDto = {
        title: 'Updated Feature Title',
        description: 'Updated Feature summary',
      };

      await request(httpServer)
        .patch(`/projects/${project.id}/features/${feature.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(updateTicketsDto);

      const payload = (await featureUpdatePromise) as TFeatureCreationPayload;
      expect(payload).toEqual(getUpdateFeaturePayloadExpectedStructure());
      expect(payload.projectId).toEqual(project.id);
      expect(payload.feature.id).toEqual(feature.id);
      expect(payload.feature.title).toEqual(updateTicketsDto.title);
      expect(payload.feature.description).toEqual(updateTicketsDto.description);
    });

    it('should trigger event as resoponse of feature delete', async () => {
      const featureDeletionPromise = waitForSocketEvent(
        user2Socket,
        FEATURE_DELETION_EVENT,
      );

      const feature = await createTestFeature(
        httpServer,
        user1Token,
        project.id,
      );

      await request(httpServer)
        .delete(`/projects/${project.id}/features/${feature.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      const payload = (await featureDeletionPromise) as TFeatureDeletionPayload;
      expect(payload).toEqual(getDeleteFeaturePayloadExpectedStructure());
      expect(payload.projectId).toEqual(project.id);
      expect(payload.featureId).toEqual(feature.id);
    });
  });

  describe('Ticket Events', () => {
    it('should trigger event as resoponse of ticket creation', async () => {
      const ticketCreationPromise = waitForSocketEvent(
        user2Socket,
        TICKET_CREATION_EVENT,
      );

      const ticket = await createTestTicket(httpServer, user1Token, project.id);

      const payload = (await ticketCreationPromise) as TTicketCreationPayload;
      expect(payload).toEqual(getCreateTicketPayloadExpectedStructure());
      expect(payload.ticket.id).toEqual(ticket.id);
    });

    it('should trigger event as resoponse of ticket update', async () => {
      const ticketUpdatePromise = waitForSocketEvent(
        user2Socket,
        TICKET_UPDATE_EVENT,
      );

      const ticket = await createTestTicket(httpServer, user1Token, project.id);

      const updateTicketsDto = {
        title: 'Updated Ticket Title',
        description: 'Updated ticket summary',
      };

      await request(httpServer)
        .patch(`/projects/${project.id}/tickets/${ticket.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(updateTicketsDto);

      const payload = (await ticketUpdatePromise) as TTicketUpdatePayload;
      expect(payload).toEqual(getUpdateTicketPayloadExpectedStructure());
      expect(payload.ticket.id).toEqual(ticket.id);
      expect(payload.ticket.title).toEqual(updateTicketsDto.title);
      expect(payload.ticket.description).toEqual(updateTicketsDto.description);
    });

    it('should trigger event as resoponse of ticket rearrangement', async () => {
      const ticketRearrangementPromise = waitForSocketEvent(
        user2Socket,
        TICKET_REARRANGEMENT_EVENT,
      );

      const ticket1 = await createTestTicket(
        httpServer,
        user1Token,
        project.id,
      );
      const ticket2 = await createTestTicket(
        httpServer,
        user1Token,
        project.id,
      );

      const updateData: UpdateTicketPositionDto = {
        data: [
          {
            id: ticket1.id,
            position: Math.floor(Math.random()) * 10,
            ticketStatus: TicketStatus.TODO,
          },
          {
            id: ticket2.id,
            position: Math.floor(Math.random()) * 10,
            ticketStatus: TicketStatus.TODO,
          },
        ],
      };

      await request(httpServer)
        .patch(`/projects/${project.id}/tickets`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(updateData);

      const payload =
        (await ticketRearrangementPromise) as TTicketRearrangementPayload;
      expect(payload).toEqual(getRearrangeTicketPayloadExpectedStructure());
      expect(payload.tickets.length).toEqual(updateData.data.length);
    });

    it('should trigger event as resoponse of ticket delete', async () => {
      const ticketDeletionPromise = waitForSocketEvent(
        user2Socket,
        TICKET_DELETION_EVENT,
      );

      const ticket = await createTestTicket(httpServer, user1Token, project.id);

      await request(httpServer)
        .delete(`/projects/${project.id}/tickets/${ticket.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      const payload = (await ticketDeletionPromise) as TTicketDeletionPayload;
      expect(payload).toEqual(getDeleteTicketPayloadExpectedStructure());
      expect(payload.projectId).toEqual(project.id);
      expect(payload.ticketId).toEqual(ticket.id);
    });
  });
});
