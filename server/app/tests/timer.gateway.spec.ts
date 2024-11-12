/* eslint-disable @typescript-eslint/no-explicit-any */
import { TimerGateway } from '@app/gateways/timer.gateway';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { TimerEventType } from '@common/timer-event-type';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { gameStub } from './stubs/game.stub';

describe('TimerGateway', () => {
    let timerGateway: TimerGateway;
    let timerService: jest.Mocked<TimerService>;
    let gameService: jest.Mocked<GameService>;
    let socketMock: jest.Mocked<Socket>;
    let serverMock: jest.Mocked<Server>;
    let broadcastMock: any;

    beforeEach(() => {
        gameService = {
            getGame: jest.fn(),
        } as any;
        timerService = {
            stopTimer: jest.fn(),
            startTimer: jest.fn(),
            pauseTimer: jest.fn(),
            accelerateTime: jest.fn(),
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

        broadcastMock = {
            emit: jest.fn(),
        } as any as BroadcastOperator<any, any>;
        timerGateway = new TimerGateway(timerService, gameService);
        timerGateway.server = serverMock;
    });

    it('should be describe', () => {
        expect(timerGateway).toBeDefined();
    });

    describe('startTimer', () => {
        it('should start the timer and emit the "startTimer" event with the correct payload', () => {
            const pin = 'mockPin';
            const eventType = TimerEventType.Question;
            const duration = 60;
            const remainingTime = 60;
            gameService.getGame.mockReturnValue(gameStub());
            // eslint-disable-next-line @typescript-eslint/no-shadow, max-params
            timerService.startTimer.mockImplementation((socketMock, pin, duration, eventType, callback) => {
                callback(remainingTime);
                return duration;
            });
            serverMock.to.mockReturnValue(broadcastMock);
            timerGateway.startTimer(socketMock, { pin, eventType, duration });
            expect(timerService.startTimer).toHaveBeenCalledWith(socketMock, pin, duration, eventType, expect.any(Function));
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('startTimer', { pin, data: { remainingTime, eventType } });
        });

        it('should start the timer and emit the "startTimer" event with the correct payload if duration is null', () => {
            const pin = 'mockPin';
            const eventType = TimerEventType.Question;
            const duration = null;
            const remainingTime = gameStub().quiz.duration;
            gameService.getGame.mockReturnValue(gameStub());
            // eslint-disable-next-line @typescript-eslint/no-shadow, max-params
            timerService.startTimer.mockImplementation((socketMock, pin, duration, eventType, callback) => {
                callback(remainingTime);
                return duration;
            });
            serverMock.to.mockReturnValue(broadcastMock);
            timerGateway.startTimer(socketMock, { pin, eventType, duration });
            expect(timerService.startTimer).toHaveBeenCalledWith(socketMock, pin, gameStub().quiz.duration, eventType, expect.any(Function));
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('startTimer', { pin, data: { remainingTime, eventType } });
        });

        it('should start the timer with the provided duration and emit the "startTimer" event with the correct payload', () => {
            const pin = 'mockPin';
            const eventType = TimerEventType.Question;
            const duration = 0;
            const remainingTime = 30;
            gameService.getGame.mockReturnValue(gameStub());
            timerService.startTimer.mockReturnValue(remainingTime);
            timerGateway.startTimer(socketMock, { pin, eventType, duration });
            expect(timerService.startTimer).toHaveBeenCalledWith(socketMock, pin, duration, eventType, expect.any(Function));
            expect(serverMock.to).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during starting the timer', () => {
            const pin = 'mockPin';
            const eventType = TimerEventType.Question;
            const duration = 30;
            gameService.getGame.mockReturnValue(gameStub());
            timerService.startTimer.mockImplementation(() => {
                throw new Error('Mock error');
            });
            timerGateway.startTimer(socketMock, { pin, eventType, duration });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('stopTimer', () => {
        const pin = 'mockPin';
        it('should stop the timer', () => {
            timerGateway.stopTimer(socketMock as Socket, { pin });
            expect(timerService.stopTimer).toHaveBeenCalledWith(socketMock, pin);
        });
        it('should emit the stopTimer event with null payload', () => {
            serverMock.to.mockReturnValue(broadcastMock);
            timerGateway.stopTimer(socketMock as Socket, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('stopTimer', { pin, data: null });
        });

        it('should emit error event if an error occurs', () => {
            const errorMessage = 'Test error message';
            const error = new Error(errorMessage);
            timerService.stopTimer = jest.fn().mockImplementation(() => {
                throw error;
            });
            timerGateway.stopTimer(socketMock as Socket, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', errorMessage);
        });
    });

    describe('togglePauseTimer', () => {
        const pin = 'mockPin';
        it('should emit the togglePauseTimer event with null payload', () => {
            const isRunning = false;
            serverMock.to.mockReturnValue(broadcastMock);
            timerService.togglePauseTimer = jest.fn().mockReturnValue(isRunning);
            timerGateway.togglePauseTimer(socketMock as Socket, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('togglePauseTimer', { pin, data: isRunning });
        });

        it('should emit error event if an error occurs', () => {
            const errorMessage = 'Test error message';
            const error = new Error(errorMessage);
            timerService.togglePauseTimer = jest.fn().mockImplementation(() => {
                throw error;
            });
            timerGateway.togglePauseTimer(socketMock as Socket, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', errorMessage);
        });
    });

    describe('accelerateTimer', () => {
        const pin = 'mockPin';
        const ticksPerSecond = 4;
        it('should emit the accelerateTimer event with null payload', () => {
            serverMock.to.mockReturnValue(broadcastMock);
            timerService.accelerateTimer = jest.fn().mockReturnValue(undefined);
            timerGateway.accelerateTimer(socketMock as Socket, { pin, ticksPerSecond });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('accelerateTimer', { pin, data: null });
        });

        it('should emit error event if an error occurs', () => {
            const errorMessage = 'Test error message';
            const error = new Error(errorMessage);
            timerService.accelerateTimer = jest.fn().mockImplementation(() => {
                throw error;
            });
            timerGateway.accelerateTimer(socketMock as Socket, { pin, ticksPerSecond });
            expect(socketMock.emit).toHaveBeenCalledWith('error', errorMessage);
        });
    });
});
