import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

@Module({
  providers: [WebsocketGateway],
  imports: [WebsocketGateway],
})
export class WebsocketModule {}
