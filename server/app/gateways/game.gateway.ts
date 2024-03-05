import { Question } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { MessageService } from '@app/services/message/message.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Submission } from '@common/submission';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
        credentials: false,
    },
})
export class GameGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server;

    constructor(
        private readonly gameService: GameService,
        private readonly timerService: TimerService,
        private readonly messageService: MessageService,
    ) {}

    @SubscribeMessage('createGame')
    async createGame(@ConnectedSocket() client: Socket, @MessageBody() { quizId }: { quizId: string }) {
        try {
            const pin = await this.gameService.createGame(client, quizId);
            client.join(pin);

            this.server.to(pin).emit('createGame', pin);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('joinGame')
    joinGame(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: { pin: string; username: string }) {
        try {
            const payload = this.gameService.joinGame(client, pin, username);
            client.join(pin);

            this.server.to(pin).emit('joinGame', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('cancelGame')
    cancelGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const payload = this.gameService.cancelGame(client, pin);
            this.server.socketsLeave(pin);

            this.server.to(pin).emit('cancelGame', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('toggleGameLock')
    toggleGameLock(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const gameState = this.gameService.toggleGameLock(client, pin);

            this.server.to(pin).emit('toggleGameLock', gameState);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('playerAbandon')
    playerAbandon(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const clientPlayer = this.gameService.playerAbandon(client, pin);
            clientPlayer.socket.leave(pin);

            this.server.to(pin).emit('playerAbandon', clientPlayer.player);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('playerBan')
    playerBan(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: { pin: string; username: string }) {
        try {
            const clientPlayer = this.gameService.playerBan(client, pin, username);
            clientPlayer.socket.leave(pin);

            this.server.to(pin).emit('playerBan', clientPlayer.player);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('submitChoices')
    submitChoices(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const payload = this.gameService.evaluateChoices(client, pin);

            client.emit('submitChoices', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('nextQuestion')
    nextQuestion(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const question = this.gameService.nextQuestion(client, pin);

            this.server.to(pin).emit('nextQuestion', question);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('toggleSelectChoice')
    toggleSelectChoice(@ConnectedSocket() client: Socket, @MessageBody() { pin, choiceIndex }: { pin: string; choiceIndex: number }) {
        try {
            const submission = this.gameService.toggleSelectChoice(client, pin, choiceIndex);
            const organizer = this.gameService.getGame(pin).organizer;

            organizer.emit('toggleSelectChoice', submission);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('startTimer')
    startTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const duration = this.timerService.startTimer(client, pin, (remainingTime) => {
                this.server.to(pin).emit('timerTick', remainingTime);
            });

            this.server.to(pin).emit('startTimer', duration);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('sendMessage')
    sendMessage(@ConnectedSocket() client: Socket, @MessageBody() { pin, message }: { pin: string; message: string }) {
        try {
            const chatlog = this.messageService.sendMessage(client, pin, message);

            this.server.to(pin).emit('sendMessage', chatlog);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('sendPlayerResults')
    getBarChartData(
        @ConnectedSocket() client: Socket,
        @MessageBody() { pin, results }: { pin: string; results: { question: Question; submissions: Submission[] }[] },
    ) {
        try {
            this.server.to(pin).emit('sendPlayerResults', results);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('playerLeaveGameEnd')
    playerLeaveGameEnd(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            client.leave(pin);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('startGame')
    startGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const firstQuestion = this.gameService.startGame(pin, client);
            this.server.to(pin).emit('startGame', firstQuestion);
        } catch (error) {
            client.emit('error', error.message);
        }
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
