import { PlayerService } from '@app/services/player/player.service';
import { GameEventPayload } from '@common/game-event-payload';
import { PinPayload } from '@common/pin-payload';
import { Player } from '@common/player';
import { PlayerEvent } from '@common/player-event';
import { PlayerUsernamePayload } from '@common/player-username-payload';
import { GeneralWebSocketEvent } from '@common/general-websocket-event';
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

    @SubscribeMessage(PlayerEvent.PlayerAbandon)
    playerAbandon(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const clientPlayer = this.playerService.playerAbandon(client, pin);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer?.player };

            this.server.to(pin).emit(PlayerEvent.PlayerAbandon, payload);

            clientPlayer?.socket?.leave(pin);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(PlayerEvent.PlayerBan)
    playerBan(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: PlayerUsernamePayload) {
        try {
            const clientPlayer = this.playerService.playerBan(client, pin, username);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer?.player };

            this.server.to(pin).emit(PlayerEvent.PlayerBan, payload);
            clientPlayer?.socket?.leave(pin);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(PlayerEvent.PlayerMute)
    playerMute(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: PlayerUsernamePayload) {
        try {
            const clientPlayer = this.playerService.playerMute(client, pin, username);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };
            this.server.to(pin).emit(PlayerEvent.PlayerMute, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    handleDisconnect(client: Socket) {
        try {
            const payload = this.playerService.disconnect(client);
            payload.forEach((pin) => {
                this.playerAbandon(client, { pin });
            });
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }
}
