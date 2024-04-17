import { GameAutopilotService } from '@app/services/game-autopilot/game-autopilot.service';
import { GameSummaryService } from '@app/services/game-summary/game-summary.service';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { BarchartSubmission } from '@common/barchart-submission';
import { CreateGamePayload } from '@common/create-game-payload';
import { GameEvent } from '@common/game-event';
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

    @SubscribeMessage(GameEvent.CreateGame)
    async createGame(@ConnectedSocket() client: Socket, @MessageBody() { quizId }: CreateGamePayload) {
        try {
            const pin = await this.gameService.createGame(client, quizId);
            client.join(pin);

            this.server.emit(GameEvent.CreateGame, pin);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.JoinGame)
    joinGame(@ConnectedSocket() client: Socket, @MessageBody() { pin, username }: JoinGamePayload) {
        try {
            const player = this.gameService.joinGame(client, pin, username);
            const payload: GameEventPayload<Player> = { pin, data: player };

            client.join(pin);
            this.server.to(pin).emit(GameEvent.JoinGame, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.StartGame)
    startGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const game = this.gameService.getGame(pin);

            if (game?.isRandom) {
                this.joinGame(client, { pin, username: 'Organisateur' });
                this.gameAutopilotService.runGame(client, pin);
            }

            const data = this.gameService.startGame(client, pin);
            const payload: GameEventPayload<QuestionPayload> = { pin, data };

            this.server.to(pin).emit(GameEvent.StartGame, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.CancelGame)
    cancelGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            this.timerService.stopTimer(client, pin);
            const message = this.gameService.cancelGame(client, pin);
            const payload: GameEventPayload<string> = { pin, data: message };

            this.server.to(pin).emit(GameEvent.CancelGame, payload);
            this.server.socketsLeave(pin);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.ToggleGameLock)
    toggleGameLock(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const gameState = this.gameService.toggleGameLock(client, pin);
            const payload: GameEventPayload<GameState> = { pin, data: gameState };

            this.server.to(pin).emit(GameEvent.ToggleGameLock, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.QcmSubmit)
    qcmSubmit(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const evaluation = this.gameService.evaluateChoices(client, pin);
            const payload: GameEventPayload<QcmEvaluation> = { pin, data: evaluation };

            this.server.to(pin).emit(GameEvent.QcmSubmit, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.NextQuestion)
    nextQuestion(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const data = this.gameService.nextQuestion(client, pin);
            const payload: GameEventPayload<QuestionPayload> = { pin, data };
            this.server.to(pin).emit(GameEvent.NextQuestion, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.QcmToggleChoice)
    qcmToggleChoice(@ConnectedSocket() client: Socket, @MessageBody() { pin, choiceIndex }: QcmToggleChoicePayload) {
        try {
            const submission = this.gameService.qcmToggleChoice(client, pin, choiceIndex);
            const organizer = this.gameService.getOrganizer(pin);
            const payload: GameEventPayload<BarchartSubmission> = { pin, data: submission };

            organizer.emit(GameEvent.QcmToggleChoice, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.EndGame)
    endGame(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const game = this.gameService.getGame(pin);
            this.gameService.endGame(client, pin);
            const payload: GameEventPayload<null> = { pin, data: null };
            this.server.to(pin).emit(GameEvent.EndGame, payload);
            this.gameSummaryService.addGameSummary().fromGame(game);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.QrlInputChange)
    qrlInputChange(@ConnectedSocket() client: Socket, @MessageBody() { pin, isTyping }: QrlInputChangePayload) {
        try {
            const chartData = this.gameService.qrlInputChange(client, pin, isTyping);
            const payload: GameEventPayload<BarchartSubmission> = { pin, data: chartData };

            this.server.to(pin).emit(GameEvent.QrlInputChange, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.QrlSubmit)
    qrlSubmit(@ConnectedSocket() client: Socket, @MessageBody() { pin, answer }: QrlSubmitPayload) {
        try {
            const submission = this.gameService.qrlSubmit(client, pin, answer);
            const payload: GameEventPayload<QrlSubmission> = { pin, data: submission };

            this.server.to(pin).emit(GameEvent.QrlSubmit, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(GameEvent.QrlEvaluate)
    qrlEvaluate(@ConnectedSocket() client: Socket, @MessageBody() { socketId, pin, grade }: QrlEvaluatePayload) {
        try {
            const qrlEvaluation = this.gameService.qrlEvaluate(socketId, pin, grade);
            const payload: GameEventPayload<QrlEvaluation> = { pin, data: qrlEvaluation };

            this.server.to(pin).emit(GameEvent.QrlEvaluate, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
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
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }
}
