import { PlayerService } from '@app/services/player/player.service';
import { GameEventPayload } from '@common/game-event-payload';
import { PinPayload } from '@common/pin-payload';
import { Player } from '@common/player';
import { PlayerEvent } from '@common/player-event-enum';
import { PlayerUsernamePayload } from '@common/player-username-payload';
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

    @SubscribeMessage(PlayerEvent.PLAYER_ABANDON_EVENT)
    playerAbandon(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const clientPlayer = this.playerService.playerAbandon(client, pin);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer?.player };

            this.server.to(pin).emit(PlayerEvent.PLAYER_ABANDON_EVENT, payload);

            clientPlayer?.socket?.leave(pin);
        } catch (error) {
            client.emit(PlayerEvent.ERROR_EVENT, error.message);
        }
    }

    @SubscribeMessage(PlayerEvent.PLAYER_BAN_EVENT)
    playerBan(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: PlayerUsernamePayload) {
        try {
            const clientPlayer = this.playerService.playerBan(client, pin, username);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer?.player };

            this.server.to(pin).emit(PlayerEvent.PLAYER_BAN_EVENT, payload);
            clientPlayer?.socket?.leave(pin);
        } catch (error) {
            client.emit(PlayerEvent.ERROR_EVENT, error.message);
        }
    }

    @SubscribeMessage(PlayerEvent.PLAYER_MUTE_EVENT)
    playerMute(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: PlayerUsernamePayload) {
        try {
            const clientPlayer = this.playerService.playerMute(client, pin, username);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };
            this.server.to(pin).emit(PlayerEvent.PLAYER_MUTE_EVENT, payload);
        } catch (error) {
            client.emit(PlayerEvent.ERROR_EVENT, error.message);
        }
    }

    handleDisconnect(client: Socket) {
        try {
            const payload = this.playerService.disconnect(client);
            payload.forEach((pin) => {
                this.playerAbandon(client, { pin });
            });
        } catch (error) {
            client.emit(PlayerEvent.ERROR_EVENT, error.message);
        }
    }
}
