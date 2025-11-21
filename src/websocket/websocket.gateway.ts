import { Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketAuthService } from './services/websocket-auth.service';
import { JwtWsGuard } from './services/guard/jwt-ws.guard';
import { AuthenticatedSocket, TTicketCreationPayload } from './websocket.types';
import { OnEvent } from '@nestjs/event-emitter';
import { TICKET_CREATION_EVENT } from './events.constant';
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

  @OnEvent(TICKET_CREATION_EVENT)
  handleTicketCreation(payload: TTicketCreationPayload) {
    this.socketService.handleTicketCreation(payload, this.server);
  }
}
