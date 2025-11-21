import { Ticket } from '@prisma/client';
import { Server, Socket } from 'socket.io';
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

export type TTicketUpdatePayload = {
  projectId: string;
  updatedBy: string;
  ticket: Ticket;
};

export type TTicketDeletionPayload = {
  projectId: string;
  deletedBy: string;
  ticketId: string;
};

export type TTicketRearrangementPayload = {
  projectId: string;
  movedBy: string;
  tickets: Ticket[];
};

export type TTicketEvent = {
  payload: Record<string, any> & { projectId: string };
  server: Server;
  event: string;
};
