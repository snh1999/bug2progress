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
import { JwtWsGuard } from './guard/jwt-ws.guard';
import { AuthenticatedSocket } from './websocket.types';

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

  constructor(private socketAuthService: SocketAuthService) {}
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
    this.logger.log(`Connected: ${client.id} | User: ${client.user.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Disconnected: ${client.id} | User: ${client.user.id}`);
  }
}
