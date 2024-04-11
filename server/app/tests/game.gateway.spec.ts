/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */ // useful especially for the socket mocking
import { GameGateway } from '@app/gateways/game.gateway';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameEventPayload } from '@common/game-event-payload';
import { GameState } from '@common/game-state';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QuestionPayload } from '@common/question-payload';
import { Submission } from '@common/submission';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { playerstub } from './stubs/player.stub';
import { qrlEvaluationStub } from './stubs/qrl-evaluation.stub';
import { qrlSubmissionStub } from './stubs/qrl.submission.stub';
import { questionStub } from './stubs/question.stubs';
import { submissionStub } from './stubs/submission.stub';
import { GameSummaryService } from '@app/services/game-summary/game-summary.service';

describe('GameGateway', () => {
    let gameGateway: GameGateway;
    let gameServiceMock: jest.Mocked<GameService>;
    let socketMock: jest.Mocked<Socket>;
    let timerServiceMock: jest.Mocked<TimerService>;
    let gameSummaryServiceMock: jest.Mocked<GameSummaryService>;
    let serverMock: jest.Mocked<Server>;
    let broadcastMock: any;

    beforeEach(() => {
        gameServiceMock = {
            createGame: jest.fn(),
            joinGame: jest.fn(),
            startGame: jest.fn(),
            cancelGame: jest.fn(),
            toggleGameLock: jest.fn(),
            getGame: jest.fn(),
            endGame: jest.fn(),
            playerAbandon: jest.fn(),
            playerBan: jest.fn(),
            evaluateChoices: jest.fn(),
            nextQuestion: jest.fn(),
            disconnect: jest.fn(),
            qcmToggleChoice: jest.fn(),
            getOrganizer: jest.fn(),
            qrlInputChange: jest.fn(),
            qrlSubmit: jest.fn(),
            qrlEvaluate: jest.fn(),
        } as any;
        socketMock = {
            id: 'organizerId',
            emit: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
        } as any;
        serverMock = {
            emit: jest.fn(),
            to: jest.fn(),
            socketsLeave: jest.fn(),
        } as any;
        timerServiceMock = {
            startTimer: jest.fn(),
            stopTimer: jest.fn(),
        } as any;
        gameSummaryServiceMock = {
            saveGameSummary: jest.fn(),
        } as any;
        broadcastMock = {
            emit: jest.fn(),
        } as any as BroadcastOperator<any, any>;
        gameGateway = new GameGateway(gameServiceMock, timerServiceMock, gameSummaryServiceMock);
        gameGateway.server = serverMock;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(gameGateway).toBeDefined();
    });

    describe('createGame', () => {
        const quizId = 'mockedQuizId';
        const errorMessage = 'an error occured';
        it('should create a game and emit the pin to the client', async () => {
            gameServiceMock.createGame.mockResolvedValue('mockedPin');
            await gameGateway.createGame(socketMock, { quizId });
            expect(socketMock.join).toHaveBeenCalledWith('mockedPin');
            expect(serverMock.emit).toHaveBeenCalledWith('createGame', 'mockedPin');
        });

        it('should emit error.message if an error occurs', async () => {
            gameServiceMock.createGame.mockRejectedValue(new Error(errorMessage));
            await gameGateway.createGame(socketMock, { quizId });
            expect(socketMock.emit).toHaveBeenCalledWith('error', errorMessage);
        });
    });

    describe('joinGame', () => {
        it('should emit "joinGame" event to the specified room', () => {
            const pin = 'mockPin';
            const username = playerstub().username;
            const player = playerstub();
            gameServiceMock.joinGame.mockReturnValue(player);
            serverMock.to.mockReturnValue(broadcastMock);
            gameGateway.joinGame(socketMock, { pin, username });
            expect(socketMock.join).toHaveBeenCalledWith(pin);
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('joinGame', { pin, data: player });
        });

        it('should emit "error" event if an error occurs during joining the game', () => {
            const pin = 'mockPin';
            const username = 'mockUsername';
            gameServiceMock.joinGame.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.joinGame(socketMock, { pin, username });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('startGame', () => {
        it('should start the game and emit the "startGame" event with the question', () => {
            const pin = 'mockPin';
            gameServiceMock.startGame.mockReturnValue(questionStub[0]);
            gameGateway.startGame(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during starting the game', () => {
            const pin = 'mockPin';
            gameServiceMock.startGame.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.startGame(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('cancelGame', () => {
        it('should cancel the game and emit the "cancelGame" event with the message', () => {
            const pin = 'mockPin';
            const cancelMessage = 'Game canceled';
            gameServiceMock.cancelGame.mockReturnValue(cancelMessage);
            serverMock.to.mockImplementation(() => {
                return gameGateway.server as any;
            });
            timerServiceMock.stopTimer.mockReturnValue(null);
            serverMock.to.mockReturnValue(broadcastMock);
            gameGateway.cancelGame(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('cancelGame', { pin, data: cancelMessage });
            expect(serverMock.socketsLeave).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during canceling the game', () => {
            const pin = 'mockPin';
            gameServiceMock.cancelGame.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.cancelGame(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('toggleGameLock', () => {
        it('should toggle the game lock state and emit the "toggleGameLock" event with the updated game state', () => {
            const pin = 'mockPin';
            const gameState = GameState.Closed;
            gameServiceMock.toggleGameLock.mockReturnValue(gameState);
            gameGateway.toggleGameLock(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during toggling the game lock', () => {
            const pin = 'mockPin';
            gameServiceMock.toggleGameLock.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.toggleGameLock(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('submitChoices', () => {
        it('should handle submitting choices and emit the "submitChoices" event with the correct payload', () => {
            const pin = 'mockPin';
            const evaluation: QcmEvaluation = {} as any;
            gameServiceMock.evaluateChoices.mockReturnValue(evaluation);
            gameGateway.qcmSubmit(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during handling submit choices', () => {
            const pin = 'mockPin';
            gameServiceMock.evaluateChoices.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.qcmSubmit(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('nextQuestion', () => {
        it('should handle requesting the next question and emit the "nextQuestion" event with the correct payload', () => {
            const pin = 'mockPin';

            gameServiceMock.nextQuestion.mockReturnValue({} as QuestionPayload);
            gameGateway.nextQuestion(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during handling the next question request', () => {
            const pin = 'mockPin';
            gameServiceMock.nextQuestion.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.nextQuestion(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });
    describe('toggleSelectChoice', () => {
        it('should toggle the selected choice for the provided pin and emit the "toggleSelectChoice" event to the organizer', () => {
            const pin = 'mockPin';
            const choiceIndex = 0;
            const submission: Submission[] = [submissionStub()];
            gameServiceMock.qcmToggleChoice.mockReturnValue(submission);
            gameServiceMock.getOrganizer.mockReturnValue(socketMock);
            gameGateway.qcmToggleChoice(socketMock, { pin, choiceIndex });
            expect(socketMock.emit).toHaveBeenCalledWith('qcmToggleChoice', { pin, data: submission });
        });

        it('should emit "error" event if an error occurs during toggling the selected choice', () => {
            const pin = 'mockPin';
            const choiceIndex = 0;
            gameServiceMock.qcmToggleChoice.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.qcmToggleChoice(socketMock, { pin, choiceIndex });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('endGame', () => {
        it('should end the game and emit the "endGame" event with the correct payload', () => {
            const pin = 'mockPin';
            gameServiceMock.getGame.mockReturnValue(null);
            serverMock.to.mockReturnValue(broadcastMock);
            gameGateway.endGame(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('endGame', { data: null, pin: 'mockPin' } as GameEventPayload<null>);
        });

        it('should emit "error" event if an error occurs during ending the game', () => {
            const pin = 'mockPin';
            gameServiceMock.endGame.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.endGame(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('qrlInputChange', () => {
        const pin = 'mockPin';
        it('should emit an error if there is an issue', () => {
            gameServiceMock.qrlInputChange.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.qrlInputChange(socketMock, { pin, isTyping: true });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
        it('should return the right payload', () => {
            gameServiceMock.qrlInputChange.mockReturnValue([true]);
            serverMock.to.mockReturnValue(broadcastMock);
            gameGateway.qrlInputChange(socketMock, { pin, isTyping: true });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('qrlInputChange', { data: [true], pin: 'mockPin' } as GameEventPayload<boolean[]>);
        });
    });

    describe('qrlSubmit', () => {
        const pin = 'mockPin';
        const answer = 'hello';
        it('should emit an error if there is an issue', () => {
            gameServiceMock.qrlSubmit.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.qrlSubmit(socketMock, { pin, answer });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });

        it('should return the right payload', () => {
            gameServiceMock.qrlSubmit.mockReturnValue(qrlSubmissionStub());
            gameServiceMock.getOrganizer.mockReturnValue(socketMock);
            gameGateway.qrlSubmit(socketMock, { pin, answer });
            expect(socketMock.emit).toHaveBeenCalledWith('qrlSubmit', { data: qrlSubmissionStub(), pin: 'mockPin' });
        });
    });

    describe('qrlEvaluate', () => {
        const pin = 'mockPin';
        const qrlEvaluation = qrlEvaluationStub();
        const grade = qrlEvaluationStub().grade;

        it('should emit an error if there is an issue', () => {
            gameServiceMock.qrlEvaluate.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.qrlEvaluate(socketMock, { socketId: 'playerId', pin, grade });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });

        it('should return the right payload', () => {
            gameServiceMock.qrlEvaluate.mockReturnValue(qrlEvaluation);
            serverMock.to.mockReturnValue(broadcastMock);
            gameGateway.qrlEvaluate(socketMock, { socketId: 'playerId', pin, grade });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('qrlEvaluate', {
                data: qrlEvaluation,
                pin: 'mockPin',
            } as GameEventPayload<QrlEvaluation>);
        });
    });

    describe('handleDisconnect', () => {
        it('should cancel games and abandon players for the disconnected client', () => {
            const canceledPin = 'canceledPin';
            const abandonedPin = 'abandonedPin';
            const endPin = 'endPin';
            const disconnectPayload = {
                toCancel: [canceledPin],
                toAbandon: [abandonedPin],
                toEnd: [endPin],
            } as any;
            gameServiceMock.disconnect.mockReturnValue(disconnectPayload);
            const cancelGameSpy = jest.spyOn(GameGateway.prototype, 'cancelGame');
            const endGameSpy = jest.spyOn(GameGateway.prototype, 'endGame');
            gameGateway.handleDisconnect(socketMock);
            expect(cancelGameSpy).toHaveBeenCalledWith(socketMock, { pin: canceledPin });
            expect(endGameSpy).toBeCalledWith(socketMock, { pin: endPin });
        });

        it('should throw an error if there is an issue', () => {
            gameServiceMock.disconnect.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.handleDisconnect(socketMock);
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });
});
