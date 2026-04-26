import { Features, Project, Ticket, TicketComment } from '@prisma/client';
import { Server, Socket } from 'socket.io';
export interface AuthenticatedSocket extends Socket {
  user: {
    id: string;
    name: string;
    username: string;
  };
  projectId?: string;
}

import { TicketStatus } from '@prisma/client';

export interface TCursorPayload {
  x: number;
  y: number;
  userId: string;
  userName: string;
  color: string;
  projectId: string;
}

export interface TicketMovePayload {
  cardId: string;
  sourceStatus: TicketStatus;
  destinationStatus: TicketStatus;
  position: number;
  projectId: string;
}

type TCreationPayload = {
  projectId: string;
  createdBy: string;
};

type TUpdatePayload = {
  projectId: string;
  updatedBy: string;
};

type TDeletePayload = {
  projectId: string;
  deletedBy: string;
};

export type TTicketCreationPayload = TCreationPayload & {
  ticket: Ticket;
};

export type TTicketUpdatePayload = TUpdatePayload & {
  ticket: Ticket;
};

export type TTicketDeletionPayload = TDeletePayload & {
  ticketId: string;
};

export type TTicketRearrangementPayload = {
  projectId: string;
  movedBy: string;
  tickets: Ticket[];
};

export type TEventTrigger = {
  payload: Record<string, any> & { projectId: string };
  server: Server;
  event: string;
};

export type TFeatureCreationPayload = TCreationPayload & {
  feature: Features;
};

export type TFeatureDeletionPayload = TCreationPayload & {
  featureId: string;
};

export type TFeatureUpdatePayload = TUpdatePayload & {
  feature: Features;
};

export type TProjectUpdatePayload = TUpdatePayload & {
  project: Project;
};

export type TProjectDeletionPayload = TDeletePayload;

export type TCommentCreationPayload = TCreationPayload & {
  comment: TicketComment;
  ticketId: string;
};

export type TCommentUpdatePayload = TUpdatePayload & {
  comment: TicketComment;
  ticketId: string;
};

export type TCommentDeletionPayload = TDeletePayload & {
  commentId: string;
  ticketId: string;
};
