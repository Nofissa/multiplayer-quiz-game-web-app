import { GameEventDispatcher } from '@app/classes/game-event-dispatcher';
import { GameService } from '@app/services/game/game.service';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
        credentials: false,
    },
})
export class GameGateway implements OnGatewayInit, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server;
    private gameEventDispatcher: GameEventDispatcher;

    constructor(private readonly gameService: GameService) {}

    @SubscribeMessage('createGame')
    async createGame(@ConnectedSocket() client: Socket, @MessageBody() { quizId }: { quizId: string }) {
        try {
            const payload = await this.gameService.createGame(client, quizId);
            client.join(payload.pin);

            this.gameEventDispatcher.sendToOrganizer('createGame', payload);
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('joinGame')
    joinGame(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: { pin: string; username: string }) {
        try {
            const payload = this.gameService.joinGame(client, pin, username);
            client.join(payload.pin);

            this.gameEventDispatcher.sendToGame('joinGame', payload);
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('playerAbandon')
    playerAbandon(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const payload = this.gameService.playerAbandon(client, pin);
            client.leave(pin);

            this.gameEventDispatcher.sendToGame('playerAbandon', payload);
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('playerBan')
    playerBan(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: { pin: string; username: string }) {
        try {
            const payload = this.gameService.playerBan(client, pin, username);

            this.gameEventDispatcher.sendToGame('playerBan', payload);
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('submitChoices')
    submitChoices(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const payload = this.gameService.evaluateChoices(client, pin);

            this.gameEventDispatcher.sendToClient('submitChoices', payload);
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('cancelGame')
    cancelGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const payload = this.gameService.cancelGame(client, pin);

            this.gameEventDispatcher.sendToGame('cancelGame', payload);
            this.server.in(pin).socketsLeave(pin);
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('toggleGameLock')
    toggleGameLock(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const payload = this.gameService.toggleGameLock(client, pin);

            this.gameEventDispatcher.sendToGame('toggleGameLock', payload);
        } catch (err) {
            return err;
        }
    }

    afterInit() {
        this.gameEventDispatcher = new GameEventDispatcher(this.server);
    }

    handleDisconnect(client: Socket) {
        const payload = this.gameService.disconnect(client);

        payload.toCancel.forEach((pin) => {
            this.cancelGame(client, { pin });
        });
        payload.toAbandon.forEach((pin) => {
            this.playerAbandon(client, { pin });
        });
    }
}
