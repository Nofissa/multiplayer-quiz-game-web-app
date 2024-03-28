import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Evaluation } from '@common/evaluation';
import { GameEventPayload } from '@common/game-event-payload';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { QuestionPayload } from '@common/question-payload';
import { Submission } from '@common/submission';
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
export class GameGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly gameService: GameService,
        private readonly timerService: TimerService,
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
            const data = this.gameService.startGame(client, pin);
            const payload: GameEventPayload<QuestionPayload> = { pin, data };

            this.server.to(pin).emit('startGame', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('cancelGame')
    cancelGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            this.timerService.stopTimer(client, pin);
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

    @SubscribeMessage('qcmSubmit')
    qcmSubmit(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const evaluation = this.gameService.evaluateChoices(client, pin);
            const payload: GameEventPayload<Evaluation> = { pin, data: evaluation };

            this.server.to(pin).emit('qcmSubmit', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('qrlInputChange')
    qrlInputChange(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            this.gameService.qrlInputChange();
            const payload: GameEventPayload<null> = { pin, data: null };
            this.server.to(pin).emit('qrlInputChange', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('qrlSubmit')
    qrlSubmit(@ConnectedSocket() client: Socket, @MessageBody() { pin, qrlText }: { pin: string; qrlText: string }) {
        try {
            this.gameService.qrlSubmit(client, pin, qrlText);
            const payload: GameEventPayload<string> = { pin, data: qrlText };

            this.server.to(pin).emit('qrlSubmit', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('nextQuestion')
    nextQuestion(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const data = this.gameService.nextQuestion(client, pin);
            const payload: GameEventPayload<QuestionPayload> = { pin, data };
            this.server.to(pin).emit('nextQuestion', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('qcmToggleChoice')
    qcmToggleChoice(@ConnectedSocket() client: Socket, @MessageBody() { pin, choiceIndex }: { pin: string; choiceIndex: number }) {
        try {
            const submission = this.gameService.qcmToggleChoice(client, pin, choiceIndex);
            const organizer = this.gameService.getOrganizer(pin);
            const payload: GameEventPayload<Submission[]> = { pin, data: submission };

            organizer.emit('qcmToggleChoice', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('endGame')
    endGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            this.timerService.stopTimer(client, pin);
            this.gameService.endGame(client, pin);
            const payload: GameEventPayload<null> = { pin, data: null };
            this.server.to(pin).emit('endGame', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    handleDisconnect(client: Socket) {
        try {
            const payload = this.gameService.disconnect(client);

            payload.toCancel.forEach((pin) => {
                this.cancelGame(client, { pin });
            });

            payload.toEnd.forEach((pin) => {
                this.endGame(client, { pin });
            });
        } catch (error) {
            client.emit('error', error.message);
        }
    }
}
