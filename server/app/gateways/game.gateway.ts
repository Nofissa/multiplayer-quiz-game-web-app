import { GameEventDispatcher } from '@app/classes/game-event-dispatcher';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
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

    constructor(
        private readonly gameService: GameService,
        private readonly timerService: TimerService,
    ) {}

    @SubscribeMessage('createGame')
    async createGame(@ConnectedSocket() client: Socket, @MessageBody() { quizId }: { quizId: string }) {
        try {
            const payload = await this.gameService.createGame(client, quizId);
            client.join(payload.pin);

            this.gameEventDispatcher.sendToOrganizer('createGame', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('joinGame')
    joinGame(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: { pin: string; username: string }) {
        try {
            const payload = this.gameService.joinGame(client, pin, username);
            client.join(payload.pin);

            this.gameEventDispatcher.sendToGame('joinGame', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('playerAbandon')
    playerAbandon(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const payload = this.gameService.playerAbandon(client, pin);
            client.leave(pin);

            this.gameEventDispatcher.sendToGame('playerAbandon', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('playerBan')
    playerBan(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: { pin: string; username: string }) {
        try {
            const payload = this.gameService.playerBan(client, pin, username);

            this.gameEventDispatcher.sendToGame('playerBan', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('submitChoices')
    submitChoices(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const payload = this.gameService.evaluateChoices(client, pin);

            this.gameEventDispatcher.sendToClient('submitChoices', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('sendMessage')
    sendMessage(@ConnectedSocket() client: Socket, @MessageBody() { pin, message }: { pin: string; message: string }) {
        try {
            const payload = this.gameService.sendMessage(client, pin, message);

            this.gameEventDispatcher.sendToGame('sendMessage', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('startTimer')
    startTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const game = this.gameService.getGame(pin);

            const duration = this.timerService.startTimer(client, game, (remainingTime) => {
                this.server.to(pin).emit('timerTick', remainingTime);
            });
            this.server.to(pin).emit('startTimer', duration);
        } catch (error) {
            client.emit('error', error.message);
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

    @SubscribeMessage('nextQuestion')
    nextQuestion(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const payload = this.gameService.nextQuestion(client, pin);

            this.gameEventDispatcher.sendToGame('nextQuestion', payload);
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('toggleSelectChoice')
    toggleSelectChoice(@ConnectedSocket() client: Socket, @MessageBody() { pin, choiceIndex }: { pin: string; choiceIndex: number }) {
        try {
            const payload = this.gameService.toggleSelectChoice(client, pin, choiceIndex);

            this.gameEventDispatcher.sendToOrganizer('toggleSelectChoice', payload);
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
