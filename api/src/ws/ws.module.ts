import { Module } from '@nestjs/common';
import { WsService } from './ws.service';
import { WsGateway } from './ws.gateway';

@Module({
  providers: [WsGateway, WsService],
})
export class WsModule {}
