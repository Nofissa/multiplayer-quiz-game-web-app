import { PlayerService } from '@app/services/player/player.service';
import { GameEventPayload } from '@common/game-event-payload';
import { Player } from '@common/player';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:4200', 'https://polytechnique-montr-al.gitlab.io', 'http://polytechnique-montr-al.gitlab.io'],
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
        credentials: false,
    },
})
export class PlayerGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly playerService: PlayerService) {}

    @SubscribeMessage('playerAbandon')
    playerAbandon(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const clientPlayer = this.playerService.playerAbandon(client, pin);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };

            this.server.to(pin).emit('playerAbandon', payload);

            clientPlayer.socket.leave(pin);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('playerBan')
    playerBan(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: { pin: string; username: string }) {
        try {
            const clientPlayer = this.playerService.playerBan(client, pin, username);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };

            this.server.to(pin).emit('playerBan', payload);
            clientPlayer.socket.leave(pin);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('playerMute')
    playerMute(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: { pin: string; username: string }) {
        try {
            const clientPlayer = this.playerService.playerMute(client, pin, username);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };
            this.server.to(pin).emit('playerMute', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    handleDisconnect(client: Socket) {
        try {
            const payload = this.playerService.disconnect(client);
            payload.forEach((pin) => {
                this.playerAbandon(client, { pin });
            });
        } catch (error) {
            client.emit('error', error.message);
        }
    }
}
