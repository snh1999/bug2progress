import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { SocketAuthService } from '../websocket-auth.service';

@Injectable()
export class JwtWsGuard implements CanActivate {
  private readonly logger = new Logger(JwtWsGuard.name);

  constructor(private socketAuthService: SocketAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') {
      throw new Error('Incorrect use of WebSocket Guard');
    }

    try {
      const client = context.switchToWs().getClient();
      await this.socketAuthService.validateSocketClient(client);
      return true;
    } catch (error) {
      if (error instanceof Error)
        this.logger.error(`JWT verification failed: ${error.message}`);
      throw new WsException('Invalid authentication token');
    }
  }
}
