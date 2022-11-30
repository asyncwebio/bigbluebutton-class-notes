import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { WsModule } from './ws/ws.module';

@Module({
  imports: [ConfigModule.forRoot(), WsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
