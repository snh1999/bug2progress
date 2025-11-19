import request from 'supertest';
import { THttpServer } from '../utils/types';
import { CreateTicketDto } from '@/ticket/dto';
import { TicketPriority, TicketStatus, TicketType } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/en';

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
  featureId?: string,
  createProjectDto?: CreateTicketDto,
): Promise<any> => {
  createProjectDto = createProjectDto ?? getCreateTicketMockDto();

  return (
    await request(httpServer)
      .post(`/projects/${projectId}/tickets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...createProjectDto, featureId })
  ).body.data;
};
