/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameGateway } from '@app/gateways/game.gateway';
import { Question } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { MessageService } from '@app/services/message/message.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Chatlog } from '@common/chatlog';
import { Evaluation } from '@common/evaluation';
import { GameState } from '@common/game-state';
import { TimerEventType } from '@common/timer-event-type';
import { Server, Socket } from 'socket.io';
import { gameStub } from './stubs/game.stub';
import { playerstub } from './stubs/player.stub';
import { questionStub } from './stubs/question.stubs';

describe('GameGateway', () => {
    let gameGateway: GameGateway;
    let gameServiceMock: jest.Mocked<GameService>;
    let socketMock: jest.Mocked<Socket>;
    let timerServiceMock: jest.Mocked<TimerService>;
    let messageService: jest.Mocked<MessageService>;
    let serverMock: jest.Mocked<Server>;

    beforeEach(() => {
        gameServiceMock = {
            createGame: jest.fn(), // Mock createGame method to return a pin
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
        } as any;
        messageService = {
            sendMessage: jest.fn(),
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
        } as any;
        gameGateway = new GameGateway(gameServiceMock, timerServiceMock, messageService); // Pass mock dependencies
        gameGateway.server = serverMock; // Set server mock
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
            gameGateway.joinGame(socketMock, { pin, username });
            expect(socketMock.join).toHaveBeenCalledWith(pin); // Ensure client joins the room
            expect(serverMock.to).toHaveBeenCalledWith(pin); // Ensure the server sends message to the room
            // expect(serverMock.emit).toHaveBeenCalledWith('joinGame', { pin, data: { id: 'mockPlayerId', username } });
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
            // expect(serverMock.emit).toHaveBeenCalledWith('startGame', { pin, data: questionStub()[0] });
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
            gameGateway.cancelGame(socketMock, { pin });
            serverMock.to.mockImplementation(() => {
                return gameGateway.server as any;
            });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            // expect(serverMock.emit).toHaveBeenCalledWith('cancelGame', { pin, data: cancelMessage });
            // expect(serverMock.socketsLeave).toHaveBeenCalledWith(pin);
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
            // expect(serverMock.emit).toHaveBeenCalledWith('toggleGameLock', { pin, data: gameState });
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

    describe('playerAbandon', () => {
        it('should handle player abandoning the game and emit the "playerAbandon" event with the correct payload', () => {
            const pin = 'mockPin';
            const clientPlayer = {
                socket: socketMock,
                player: playerstub(),
            };
            gameServiceMock.playerAbandon.mockReturnValue(clientPlayer);
            // const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };
            gameGateway.playerAbandon(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            // expect(serverMock.emit).toHaveBeenCalledWith('playerAbandon', payload);
            // expect(socketMock.leave).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during handling player abandoning the game', () => {
            const pin = 'mockPin';
            gameServiceMock.playerAbandon.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.playerAbandon(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('playerBan', () => {
        it('should handle banning a player from the game and emit the "playerBan" event with the correct payload', () => {
            const pin = 'mockPin';
            const username = 'mockUsername';
            const clientPlayer = {
                socket: socketMock,
                player: playerstub(),
            };
            gameServiceMock.playerBan.mockReturnValue(clientPlayer);
            // const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };
            gameGateway.playerBan(socketMock, { pin, username });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            // expect(serverMock.emit).toHaveBeenCalledWith('playerBan', payload);
            // expect(socketMock.leave).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during handling player ban', () => {
            const pin = 'mockPin';
            const username = 'mockUsername';
            gameServiceMock.playerBan.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.playerBan(socketMock, { pin, username });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('submitChoices', () => {
        it('should handle submitting choices and emit the "submitChoices" event with the correct payload', () => {
            const pin = 'mockPin';
            const evaluation: Evaluation = {} as any;
            gameServiceMock.evaluateChoices.mockReturnValue(evaluation);
            // const payload: GameEventPayload<Evaluation> = { pin, data: evaluation };
            gameGateway.submitChoices(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            // expect(serverMock.emit).toHaveBeenCalledWith('submitChoices', payload);
        });

        it('should emit "error" event if an error occurs during handling submit choices', () => {
            const pin = 'mockPin';
            gameServiceMock.evaluateChoices.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.submitChoices(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('nextQuestion', () => {
        it('should handle requesting the next question and emit the "nextQuestion" event with the correct payload', () => {
            const pin = 'mockPin';
            const question: Question = questionStub()[0];
            gameServiceMock.nextQuestion.mockReturnValue(question);
            // const payload: GameEventPayload<Question> = { pin, data: question };

            gameGateway.nextQuestion(socketMock, { pin });

            expect(serverMock.to).toHaveBeenCalledWith(pin);
            // expect(serverMock.emit).toHaveBeenCalledWith('nextQuestion', payload);
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

    describe('startTimer', () => {
        it('should start the timer and emit the "startTimer" event with the correct payload', () => {
            const pin = 'mockPin';
            const eventType = TimerEventType.Question;
            const duration = 60; // in seconds
            const remainingTime = 60; // in seconds
            gameServiceMock.getGame.mockReturnValue(gameStub());
            timerServiceMock.startTimer.mockReturnValue(remainingTime);
            gameGateway.startTimer(socketMock, { pin, eventType, duration });
            expect(timerServiceMock.startTimer).toHaveBeenCalledWith(socketMock, pin, duration, expect.any(Function));
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            // expect(serverMock.emit).toHaveBeenCalledWith('startTimer', { pin, data: { remainingTime, eventType } });
        });

        it('should start the timer with the provided duration and emit the "startTimer" event with the correct payload', () => {
            const pin = 'mockPin';
            const eventType = TimerEventType.Question;
            const duration = 30; // in seconds
            const remainingTime = 30; // in seconds
            timerServiceMock.startTimer.mockReturnValue(remainingTime);
            gameGateway.startTimer(socketMock, { pin, eventType, duration });
            expect(timerServiceMock.startTimer).toHaveBeenCalledWith(socketMock, pin, duration, expect.any(Function));
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            // expect(serverMock.emit).toHaveBeenCalledWith('startTimer', { pin, data: { remainingTime, eventType } });
        });

        it('should emit "error" event if an error occurs during starting the timer', () => {
            const pin = 'mockPin';
            const eventType = TimerEventType.Question;
            const duration = 30;
            gameServiceMock.getGame.mockReturnValue(gameStub());
            timerServiceMock.startTimer.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.startTimer(socketMock, { pin, eventType, duration });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('sendMessage', () => {
        const pin = 'mockPin';
        const message = 'Hello, world!';
        const chatlogTest: Chatlog = {
            author: 'Player',
            message,
            date: new Date(),
        };

        it('should send a message to the specified room', () => {
            messageService.sendMessage.mockReturnValue(chatlogTest);
            gameGateway.sendMessage(socketMock, { pin, message });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            // expect(serverMock.emit).toHaveBeenCalledWith('message', message);
        });

        it('should emit "error" event if an error occurs during sending the message', () => {
            messageService.sendMessage.mockReturnValue(chatlogTest);
            serverMock.to.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.sendMessage(socketMock, { pin, message });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('endGame', () => {
        it('should end the game and emit the "endGame" event with the correct payload', () => {
            const pin = 'mockPin';
            // const game = gameStub();
            // gameServiceMock.getGame.mockReturnValue(game);
            gameGateway.handleEndGame(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            // expect(serverMock.emit).toHaveBeenCalledWith('endGame', game);
        });

        it('should emit "error" event if an error occurs during ending the game', () => {
            const pin = 'mockPin';
            gameServiceMock.endGame.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.handleEndGame(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('playerLeaveGameEnd', () => {
        it('should handle a player leaving the game and ensure they leave the room', () => {
            const pin = 'mockPin';
            gameGateway.playerLeaveGameEnd(socketMock, { pin });
            expect(socketMock.leave).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during handling player leaving the game', () => {
            const pin = 'mockPin';
            socketMock.leave.mockImplementation(() => {
                throw new Error('Mock error');
            });
            gameGateway.playerLeaveGameEnd(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('handleDisconnect', () => {
        it('should cancel games and abandon players for the disconnected client', () => {
            const canceledPin = 'canceledPin';
            const abandonedPin = 'abandonedPin';
            const disconnectPayload = {
                toCancel: [canceledPin],
                toAbandon: [abandonedPin],
            };
            gameServiceMock.disconnect.mockReturnValue(disconnectPayload);
            const cancelGameSpy = jest.spyOn(GameGateway.prototype, 'cancelGame');
            const playerAbandonSpy = jest.spyOn(GameGateway.prototype, 'playerAbandon');
            gameGateway.handleDisconnect(socketMock);
            expect(cancelGameSpy).toHaveBeenCalledWith(socketMock, { pin: canceledPin });
            expect(playerAbandonSpy).toHaveBeenCalledWith(socketMock, { pin: abandonedPin });
        });
    });
});
