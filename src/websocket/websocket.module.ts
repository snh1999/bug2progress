import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { SocketAuthService } from './services/websocket-auth.service';
import { WebsocketService } from './services/websocket.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [WebsocketGateway, SocketAuthService, WebsocketService],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
