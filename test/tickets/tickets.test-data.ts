import { faker } from '@faker-js/faker/.';
import request from 'supertest';
import { THttpServer } from '../utils/types';
import { CreateTicketDto } from '@/ticket/dto';
import { TicketPriority, TicketStatus, TicketType } from '@prisma/client';

export const getCreateTicketMockDto = (): CreateTicketDto => ({
  title: faker.lorem.sentence(),
  description: faker.lorem.sentence(),
  position: 0,
  ticketType: faker.helpers.enumValue(TicketType),
  ticketPriority: faker.helpers.enumValue(TicketPriority),
  ticketStatus: faker.helpers.enumValue(TicketStatus),
});

export const createTestTicket = async (
  httpServer: THttpServer,
  accessToken: string,
  projectId: string,
  featureId: string,
  createProjectDto?: CreateTicketDto,
): Promise<any> =>
  (
    await request(httpServer)
      .post(`/projects/${projectId}/features/${featureId}/tickets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createProjectDto ?? getCreateTicketMockDto())
  ).body.data;
