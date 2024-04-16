import { MessageService } from '@app/services/message/message.service';
import { Chatlog } from '@common/chatlog';
import { GameEventPayload } from '@common/game-event-payload';
import { MessageEvent } from '@common/message-event';
import { MessagePayload } from '@common/message-payload';
import { GeneralWebSocketEvent } from '@common/general-websocket-event';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:4200', 'https://polytechnique-montr-al.gitlab.io', 'http://polytechnique-montr-al.gitlab.io'],
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
        credentials: false,
    },
})
export class MessageGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly messageService: MessageService) {}

    @SubscribeMessage(MessageEvent.SendMessage)
    sendMessage(@ConnectedSocket() client: Socket, @MessageBody() { pin, message }: MessagePayload) {
        try {
            const chatlog = this.messageService.sendMessage(client, pin, message);
            const payload: GameEventPayload<Chatlog> = { pin, data: chatlog };

            this.server.to(pin).emit(MessageEvent.SendMessage, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }
}
