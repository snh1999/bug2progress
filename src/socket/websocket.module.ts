import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { SocketAuthService } from './services/websocket-auth.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [WebsocketGateway, SocketAuthService],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
