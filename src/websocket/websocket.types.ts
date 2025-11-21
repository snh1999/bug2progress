import { Ticket } from '@prisma/client';
import { Socket } from 'socket.io';
export interface AuthenticatedSocket extends Socket {
  user: {
    id: string;
    name: string;
    username: string;
  };
  projectId?: string;
}

export type TTicketCreationPayload = {
  projectId: string;
  creatorId: string;
  ticket: Ticket;
};
