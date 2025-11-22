import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { bootstrapTestServer } from '../utils/bootstrap';
import { getAccessToken } from '../helpers/access-token.helper';
import request from 'supertest';
import { connectSocket, waitForSocketEvent } from './websockets.helpers';
import { createTestProject } from '../project/project.test-data';
import { createTestTicket } from '../tickets/tickets.test-data';
import { THttpServer } from '../utils/types';
import {
  TICKET_CREATION_EVENT,
  TICKET_DELETION_EVENT,
  TICKET_REARRANGEMENT_EVENT,
  TICKET_UPDATE_EVENT,
} from '@/websocket/events.constant';
import { Socket } from 'socket.io-client';
import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  getCreateTicketPayloadExpectedStructure,
  getDeleteTicketPayloadExpectedStructure,
  getRearrangeTicketPayloadExpectedStructure,
  getUpdateTicketPayloadExpectedStructure,
} from './websocket.expected-structure';
import { TTicketCreationPayload } from '@/websocket/websocket.types';
import { UpdateTicketPositionDto } from '@/ticket/dto';
import { TicketStatus } from '@prisma/client';

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

    project = await createTestProject(httpServerInstance, user1Token);
  });

  afterAll(async () => {
    await dbService.clearDB();
    await app.close();
  });

  beforeEach(async () => {
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
      throw error; // Fail the test
    }
  });

  afterEach(async () => {
    if (user1Socket?.connected) user1Socket.disconnect();
    if (user2Socket?.connected) user2Socket.disconnect();

    user1Socket?.removeAllListeners();
    user2Socket?.removeAllListeners();
  });

  // describe('Socket Authentication check', () => {
  //   it('should create websocket with token', async () => {
  //     const ioClient = io(baseUrl, {
  //       auth: { token: `Bearer ${user1Token}` },
  //       query: { projectId: project.id },
  //       transports: ['websocket'],
  //       reconnection: false,
  //     });

  //     ioClient.connect();

  //     ioClient.disconnect();
  //   });

  //   it('should create websocket with token', async () => {
  //     const ioClient = io(baseUrl, {
  //       query: { projectId: project.id },
  //       transports: ['websocket'],
  //       reconnection: false,
  //     });

  //     ioClient.connect();

  //     ioClient.disconnect();
  //   });
  // });

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
      const ticketCreationPromise = waitForSocketEvent(
        user2Socket,
        TICKET_UPDATE_EVENT,
      );

      const ticket = await createTestTicket(httpServer, user1Token, project.id);

      const updateTicketsDto = {
        title: 'Updated Project Title',
        description: 'Updated ticket summary',
      };

      await request(httpServer)
        .patch(`/projects/${project.id}/tickets/${ticket.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(updateTicketsDto);

      const payload = (await ticketCreationPromise) as TTicketCreationPayload;
      expect(payload).toEqual(getUpdateTicketPayloadExpectedStructure());
      expect(payload.ticket.id).toEqual(ticket.id);
      expect(payload.ticket.title).toEqual(updateTicketsDto.title);
      expect(payload.ticket.description).toEqual(updateTicketsDto.description);
    });

    it('should trigger event as resoponse of ticket rearrangement', async () => {
      const ticketCreationPromise = waitForSocketEvent(
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

      const payload = (await ticketCreationPromise) as TTicketCreationPayload;
      console.log(payload);

      expect(payload).toEqual(getRearrangeTicketPayloadExpectedStructure());
    });

    it('should trigger event as resoponse of ticket delete', async () => {
      const ticketCreationPromise = waitForSocketEvent(
        user2Socket,
        TICKET_DELETION_EVENT,
      );

      const ticket = await createTestTicket(httpServer, user1Token, project.id);

      await request(httpServer)
        .delete(`/projects/${project.id}/tickets/${ticket.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      const payload = (await ticketCreationPromise) as TTicketCreationPayload;
      expect(payload).toEqual(getDeleteTicketPayloadExpectedStructure());
    });
  });
});
