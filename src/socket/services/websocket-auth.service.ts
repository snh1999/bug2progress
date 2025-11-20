import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthenticatedSocket } from '../websocket.types';

@Injectable()
export class SocketAuthService {
  private readonly logger = new Logger(SocketAuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateSocketClient(client: AuthenticatedSocket) {
    const token = this.extractToken(client);
    const payload = await this.verifyToken(token);
    client.user = payload;
    this.logger.log(`User ${payload.id} authenticated via WebSocket`);
  }

  private extractToken(client: Socket): string {
    const handshake = client.handshake;

    if (!handshake) {
      throw new WsException('Invalid WebSocket handshake');
    }

    const token =
      handshake.auth?.token ||
      handshake.headers?.authorization?.replace('Bearer ', '') ||
      handshake.query?.token;

    if (!token) {
      this.logger.warn('No JWT token provided in WebSocket handshake');
      throw new WsException('No authentication token provided');
    }

    return token;
  }

  private async verifyToken(token: string) {
    try {
      const secret = this.configService.get<string>('JWT_KEY');
      const payload = await this.jwtService.verify(token, { secret });

      return {
        id: payload.sub || payload.id,
        username: payload.username,
        name: payload.name,
      };
    } catch (error) {
      if (error instanceof Error)
        this.logger.error(`JWT verification failed: ${error.message}`);
      throw new WsException('Invalid authentication token');
    }
  }
}
