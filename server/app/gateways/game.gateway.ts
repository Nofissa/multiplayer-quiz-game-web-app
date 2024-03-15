import { Question } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { MessageService } from '@app/services/message/message.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Chatlog } from '@common/chatlog';
import { GameEventPayload } from '@common/game-event-payload';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { Submission } from '@common/submission';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Evaluation } from '@common/evaluation';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:4200', 'https://polytechnique-montr-al.gitlab.io', 'http://polytechnique-montr-al.gitlab.io'],
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

            this.server.emit('createGame', pin);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('joinGame')
    joinGame(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: { pin: string; username: string }) {
        try {
            const player = this.gameService.joinGame(client, pin, username);
            const payload: GameEventPayload<Player> = { pin, data: player };

            client.join(pin);
            this.server.to(pin).emit('joinGame', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('startGame')
    startGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const question = this.gameService.startGame(client, pin);
            const payload: GameEventPayload<Question> = { pin, data: question };

            this.server.to(pin).emit('startGame', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('cancelGame')
    cancelGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const message = this.gameService.cancelGame(client, pin);
            const payload: GameEventPayload<string> = { pin, data: message };

            this.server.to(pin).emit('cancelGame', payload);
            this.server.socketsLeave(pin);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('toggleGameLock')
    toggleGameLock(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const gameState = this.gameService.toggleGameLock(client, pin);
            const payload: GameEventPayload<GameState> = { pin, data: gameState };

            this.server.to(pin).emit('toggleGameLock', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('playerAbandon')
    playerAbandon(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const clientPlayer = this.gameService.playerAbandon(client, pin);
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
            const clientPlayer = this.gameService.playerBan(client, pin, username);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };

            this.server.to(pin).emit('playerBan', payload);
            clientPlayer.socket.leave(pin);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('submitChoices')
    submitChoices(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const evaluation = this.gameService.evaluateChoices(client, pin);
            const payload: GameEventPayload<Evaluation> = { pin, data: evaluation };

            this.server.to(pin).emit('submitChoices', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('nextQuestion')
    nextQuestion(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const question = this.gameService.nextQuestion(client, pin);

            const payload: GameEventPayload<Question> = { pin, data: question };
            this.server.to(pin).emit('nextQuestion', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('toggleSelectChoice')
    toggleSelectChoice(@ConnectedSocket() client: Socket, @MessageBody() { pin, choiceIndex }: { pin: string; choiceIndex: number }) {
        try {
            const submissions = this.gameService.toggleSelectChoice(client, pin, choiceIndex);
            const payload: GameEventPayload<Submission[]> = { pin, data: submissions };
            const organizer = this.gameService.getGame(pin).organizer;

            organizer.emit('toggleSelectChoice', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('startTimer')
    startTimer(
        @ConnectedSocket() client: Socket,
        @MessageBody() { pin, eventType, duration }: { pin: string; eventType: TimerEventType; duration?: number },
    ) {
        try {
            duration = duration ?? this.gameService.getGame(pin).quiz.duration;
            const startRemainingTime = this.timerService.startTimer(client, pin, duration, (remainingTime) => {
                const timerTickPayload: GameEventPayload<TimerPayload> = { pin, data: { remainingTime, eventType } };
                this.server.to(pin).emit('timerTick', timerTickPayload);
            });
            const startTimerPayload: GameEventPayload<TimerPayload> = { pin, data: { remainingTime: startRemainingTime, eventType } };

            this.server.to(pin).emit('startTimer', startTimerPayload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('stopTimer')
    stopTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            this.timerService.stopTimer(client, pin);
            const payload: GameEventPayload<null> = { pin, data: null };

            this.server.to(pin).emit('stopTimer', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('sendMessage')
    sendMessage(@ConnectedSocket() client: Socket, @MessageBody() { pin, message }: { pin: string; message: string }) {
        try {
            const chatlog = this.messageService.sendMessage(client, pin, message);
            const payload: GameEventPayload<Chatlog> = { pin, data: chatlog };

            this.server.to(pin).emit('sendMessage', payload);
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
