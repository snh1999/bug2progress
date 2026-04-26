import { Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketAuthService } from './services/websocket-auth.service';
import { JwtWsGuard } from './services/guard/jwt-ws.guard';
import {
  AuthenticatedSocket,
  TCursorPayload,
  TCommentCreationPayload,
  TCommentDeletionPayload,
  TCommentUpdatePayload,
  TFeatureCreationPayload,
  TFeatureDeletionPayload,
  TFeatureUpdatePayload,
  TProjectDeletionPayload,
  TProjectUpdatePayload,
  TTicketCreationPayload,
  TTicketDeletionPayload,
  TTicketRearrangementPayload,
  TTicketUpdatePayload,
} from './websocket.types';
import { OnEvent } from '@nestjs/event-emitter';
import {
  TICKET_REARRANGEMENT_EVENT,
  TICKET_CREATION_EVENT,
  TICKET_UPDATE_EVENT,
  TICKET_DELETION_EVENT,
  FEATURE_CREATION_EVENT,
  FEATURE_DELETION_EVENT,
  FEATURE_UPDATE_EVENT,
  PROJECT_UPDATE_EVENT,
  PROJECT_DELETION_EVENT,
  CURSOR_POSITION_EVENT,
  CURSOR_INACTIVE_EVENT,
  CURSOR_STOP_EVENT,
  COMMENT_CREATION_EVENT,
  COMMENT_UPDATE_EVENT,
  COMMENT_DELETION_EVENT,
} from './events.constant';
import { WebsocketService } from './services/websocket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
@UseGuards(JwtWsGuard)
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private socketAuthService: SocketAuthService,
    private socketService: WebsocketService,
  ) {}
  private logger = new Logger(WebsocketGateway.name);

  afterInit(server: Server) {
    server.use(async (socket, next) => {
      try {
        const client = socket as AuthenticatedSocket;
        this.logger.log(`Authenticating connection: ${client.id}`);
        await this.socketAuthService.validateSocketClient(client);
        next();
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`Authentication failed: ${error.message}`);
          next(error);
        } else {
          next(new Error('Authentication failed'));
        }
      }
    });
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.socketService.handleConnection(client);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Disconnected: ${client.id} | User: ${client.user.id}`);
  }

  @SubscribeMessage(CURSOR_POSITION_EVENT)
  handleCursorPosition(client: AuthenticatedSocket, payload: TCursorPayload) {
    this.socketService.handleCursorPosition(client, payload);
  }

  @SubscribeMessage(CURSOR_STOP_EVENT)
  handleCursorStop(client: AuthenticatedSocket) {
    if (!client.projectId) {
      return;
    }
    this.socketService.handleEventTrigger({
      payload: { userId: client.user.id, projectId: client.projectId },
      server: this.server,
      event: CURSOR_INACTIVE_EVENT,
    });
  }

  @OnEvent(TICKET_CREATION_EVENT)
  handleTicketCreation(payload: TTicketCreationPayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: TICKET_CREATION_EVENT,
    });
  }

  @OnEvent(TICKET_UPDATE_EVENT)
  handleTicketUpdate(payload: TTicketUpdatePayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: TICKET_UPDATE_EVENT,
    });
  }

  @OnEvent(TICKET_DELETION_EVENT)
  handleTicketDelete(payload: TTicketDeletionPayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: TICKET_DELETION_EVENT,
    });
  }

  @OnEvent(TICKET_REARRANGEMENT_EVENT)
  handleTicketRearrangement(payload: TTicketRearrangementPayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: TICKET_REARRANGEMENT_EVENT,
    });
  }

  @OnEvent(FEATURE_CREATION_EVENT)
  handleFeatureCreation(payload: TFeatureCreationPayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: FEATURE_CREATION_EVENT,
    });
  }

  @OnEvent(FEATURE_DELETION_EVENT)
  handleFeatureDeletion(payload: TFeatureDeletionPayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: FEATURE_DELETION_EVENT,
    });
  }

  @OnEvent(FEATURE_UPDATE_EVENT)
  handleFeatureUpdate(payload: TFeatureUpdatePayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: FEATURE_UPDATE_EVENT,
    });
  }

  @OnEvent(PROJECT_UPDATE_EVENT)
  handleProjectUpdate(payload: TProjectUpdatePayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: PROJECT_UPDATE_EVENT,
    });
  }

  @OnEvent(PROJECT_DELETION_EVENT)
  handleProjectDeletion(payload: TProjectDeletionPayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: PROJECT_DELETION_EVENT,
    });
  }

  @OnEvent(COMMENT_CREATION_EVENT)
  handleCommentCreation(payload: TCommentCreationPayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: COMMENT_CREATION_EVENT,
    });
  }

  @OnEvent(COMMENT_UPDATE_EVENT)
  handleCommentUpdate(payload: TCommentUpdatePayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: COMMENT_UPDATE_EVENT,
    });
  }

  @OnEvent(COMMENT_DELETION_EVENT)
  handleCommentDeletion(payload: TCommentDeletionPayload) {
    this.socketService.handleEventTrigger({
      payload,
      server: this.server,
      event: COMMENT_DELETION_EVENT,
    });
  }
}
