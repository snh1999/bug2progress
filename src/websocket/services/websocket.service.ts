import { Injectable, Logger } from '@nestjs/common';

import {
  AuthenticatedSocket,
  TCursorPayload,
  TEventTrigger,
} from '../websocket.types';
import {
  CURSOR_INACTIVE_EVENT,
  CURSOR_UPDATE_EVENT,
  USER_DISCONNECTED,
} from '../events.constant';

@Injectable()
export class WebsocketService {
  private logger = new Logger(WebsocketService.name);
  private activeCursors = new Map<string, NodeJS.Timeout>();

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
    const cursorTimeout = this.activeCursors.get(socket.user.id);
    if (cursorTimeout) {
      clearTimeout(cursorTimeout);
      this.activeCursors.delete(socket.user.id);
    }

    if (socket.projectId) {
      socket.to(this.getRoomId(socket.projectId)).emit(USER_DISCONNECTED, {
        userId: socket.user.id,
        timestamp: new Date(),
      });
    }
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  handleCursorPosition(client: AuthenticatedSocket, payload: TCursorPayload) {
    if (!client.projectId) return;

    client.to(this.getRoomId(client.projectId)).emit(CURSOR_UPDATE_EVENT, {
      x: payload.x,
      y: payload.y,
      userId: client.user.id,
      userName: payload.userName,
      color: payload.color,
    });

    this.resetCursorTimeout(client);
  }

  private resetCursorTimeout(client: AuthenticatedSocket) {
    const existingTimeout = this.activeCursors.get(client.user.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout - mark cursor inactive after 5 seconds
    const timeout = setTimeout(() => {
      if (client.projectId) {
        client
          .to(this.getRoomId(client.projectId))
          .emit(CURSOR_INACTIVE_EVENT, {
            userId: client.user.id,
          });
      }
      this.activeCursors.delete(client.user.id);
    }, 5000);

    this.activeCursors.set(client.user.id, timeout);
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
