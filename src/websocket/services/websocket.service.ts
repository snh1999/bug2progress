import { Injectable, Logger } from '@nestjs/common';

import { Server } from 'socket.io';
import {
  AuthenticatedSocket,
  TTicketCreationPayload,
} from '../websocket.types';
import { TICKET_CREATION_EVENT, USER_DISCONNECTED } from '../events.constant';

@Injectable()
export class WebsocketService {
  private logger = new Logger(WebsocketService.name);

  constructor() {}

  async handleConnection(client: AuthenticatedSocket) {
    const user = client.user;
    const projectId = client.projectId;
    if (!user || !projectId) {
      client.disconnect(true);
      return;
    }

    client.join(this.getRoomId(projectId));
    this.logger.log(`User ${user.id} joined project ${projectId}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    if (client.projectId) {
      client.to(this.getRoomId(client.projectId)).emit(USER_DISCONNECTED, {
        userId: client.user.id,
        timestamp: new Date(),
      });
    }
  }

  handleTicketCreation(payload: TTicketCreationPayload, server: Server) {
    server.to(this.getRoomId(payload.projectId)).emit(TICKET_CREATION_EVENT, {
      project: payload.projectId,
      timestamp: new Date(),
    });
  }

  private getRoomId(projectId: string) {
    return `project:${projectId}`;
  }
}
