import { MessageService } from '@app/services/message/message.service';
import { Chatlog } from '@common/chatlog';
import { GameEventPayload } from '@common/game-event-payload';
import { MessageEvent } from '@common/message-event-enums';
import { MessagePayload } from '@common/message-payload';
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

    @SubscribeMessage(MessageEvent.SEND_MESSAGE_EVENT)
    sendMessage(@ConnectedSocket() client: Socket, @MessageBody() { pin, message }: MessagePayload) {
        try {
            const chatlog = this.messageService.sendMessage(client, pin, message);
            const payload: GameEventPayload<Chatlog> = { pin, data: chatlog };

            this.server.to(pin).emit(MessageEvent.SEND_MESSAGE_EVENT, payload);
        } catch (error) {
            client.emit(MessageEvent.ERROR_EVENT, error.message);
        }
    }
}
