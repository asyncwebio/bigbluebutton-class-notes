import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsService } from './ws.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsGateway implements OnGatewayConnection {
  constructor(private readonly wsService: WsService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('TRANSCRIPTION')
  async onTranscription(
    @MessageBody()
    data: {
      transcription: string;
      sourceLang: string;
      meetingId: string;
    },
  ) {
    this.server.in(data.meetingId).emit('TRANSCRIPTION', {
      [data.sourceLang]: {
        text: data.transcription,
      },
    });
  }

  handleConnection(socket: Socket) {
    socket.on('CREATE_CHANNEL', (channel) => {
      socket.join(channel);
    });
  }
}
