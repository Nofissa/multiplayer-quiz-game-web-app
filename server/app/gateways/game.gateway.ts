import { GameAutopilotService } from '@app/services/game-autopilot/game-autopilot.service';
import { GameSummaryService } from '@app/services/game-summary/game-summary.service';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { BarchartSubmission } from '@common/barchart-submission';
import { GameEventPayload } from '@common/game-event-payload';
import { GameState } from '@common/game-state';
import { JoinGamePayload } from '@common/join-game-payload';
import { PinPayload } from '@common/pin-payload';
import { Player } from '@common/player';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QcmToggleChoicePayload } from '@common/qcm-toggle-choice-payload';
import { QrlEvaluatePayload } from '@common/qrl-evaluate-payload';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlInputChangePayload } from '@common/qrl-input-change-payload';
import { QrlSubmission } from '@common/qrl-submission';
import { QrlSubmitPayload } from '@common/qrl-submit-payload';
import { QuestionPayload } from '@common/question-payload';
import { QuizIdPayload } from '@common/quiz-id-payload';
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

    // Disabled because the gateway depends on many services
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameService: GameService,
        private readonly timerService: TimerService,
        private readonly gameSummaryService: GameSummaryService,
        private readonly gameAutopilotService: GameAutopilotService,
    ) {}

    @SubscribeMessage('createGame')
    async createGame(@ConnectedSocket() client: Socket, @MessageBody() { quizId }: QuizIdPayload) {
        try {
            const pin = await this.gameService.createGame(client, quizId);
            client.join(pin);

            this.server.emit('createGame', pin);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('joinGame')
    joinGame(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: JoinGamePayload) {
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
    startGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const game = this.gameService.getGame(pin);

            if (game?.isRandom) {
                this.joinGame(client, { pin, username: 'Organisateur' });
                this.gameAutopilotService.runGame(client, pin);
            }

            const data = this.gameService.startGame(client, pin);
            const payload: GameEventPayload<QuestionPayload> = { pin, data };

            this.server.to(pin).emit('startGame', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('cancelGame')
    cancelGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
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
    toggleGameLock(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const gameState = this.gameService.toggleGameLock(client, pin);
            const payload: GameEventPayload<GameState> = { pin, data: gameState };

            this.server.to(pin).emit('toggleGameLock', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('qcmSubmit')
    qcmSubmit(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const evaluation = this.gameService.evaluateChoices(client, pin);
            const payload: GameEventPayload<QcmEvaluation> = { pin, data: evaluation };

            this.server.to(pin).emit('qcmSubmit', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('nextQuestion')
    nextQuestion(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const data = this.gameService.nextQuestion(client, pin);
            const payload: GameEventPayload<QuestionPayload> = { pin, data };
            this.server.to(pin).emit('nextQuestion', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('qcmToggleChoice')
    qcmToggleChoice(@ConnectedSocket() client: Socket, @MessageBody() { pin, choiceIndex }: QcmToggleChoicePayload) {
        try {
            const submission = this.gameService.qcmToggleChoice(client, pin, choiceIndex);
            const organizer = this.gameService.getOrganizer(pin);
            const payload: GameEventPayload<BarchartSubmission> = { pin, data: submission };

            organizer.emit('qcmToggleChoice', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('endGame')
    endGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const game = this.gameService.getGame(pin);
            this.gameService.endGame(client, pin);
            const payload: GameEventPayload<null> = { pin, data: null };
            this.server.to(pin).emit('endGame', payload);
            this.gameSummaryService.addGameSummary().fromGame(game);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('qrlInputChange')
    qrlInputChange(@ConnectedSocket() client: Socket, @MessageBody() { pin, isTyping }: QrlInputChangePayload) {
        try {
            const chartData = this.gameService.qrlInputChange(client, pin, isTyping);
            const payload: GameEventPayload<BarchartSubmission> = { pin, data: chartData };

            this.server.to(pin).emit('qrlInputChange', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('qrlSubmit')
    qrlSubmit(@ConnectedSocket() client: Socket, @MessageBody() { pin, answer }: QrlSubmitPayload) {
        try {
            const submission = this.gameService.qrlSubmit(client, pin, answer);
            const organizer = this.gameService.getOrganizer(pin);
            const payload: GameEventPayload<QrlSubmission> = { pin, data: submission };

            organizer.emit('qrlSubmit', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('qrlEvaluate')
    qrlEvaluate(@ConnectedSocket() client: Socket, @MessageBody() { socketId, pin, grade }: QrlEvaluatePayload) {
        try {
            const qrlEvaluation = this.gameService.qrlEvaluate(socketId, pin, grade);
            const payload: GameEventPayload<QrlEvaluation> = { pin, data: qrlEvaluation };

            this.server.to(pin).emit('qrlEvaluate', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    handleDisconnect(client: Socket) {
        try {
            const payload = this.gameService.disconnect(client);

            payload.forEach((pin) => {
                this.gameAutopilotService.stopGame(pin);
                this.cancelGame(client, { pin });
            });
        } catch (error) {
            client.emit('error', error.message);
        }
    }
}
