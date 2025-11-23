import { Injectable, Logger } from '@nestjs/common';

import { AuthenticatedSocket, TEventTrigger } from '../websocket.types';
import { USER_DISCONNECTED } from '../events.constant';

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

  handleDisconnect(socket: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${socket.id}`);

    if (socket.projectId) {
      socket.to(this.getRoomId(socket.projectId)).emit(USER_DISCONNECTED, {
        userId: socket.user.id,
        timestamp: new Date(),
      });
    }
  }

  handleEventTrigger({ server, event, payload }: TEventTrigger) {
    server.to(this.getRoomId(payload.projectId)).emit(event, {
      ...payload,
      timestamp: new Date(),
    });
  }

  private getRoomId(projectId: string) {
    return `project:${projectId}`;
  }
}
