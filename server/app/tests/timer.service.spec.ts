/* eslint-disable @typescript-eslint/no-explicit-any */ // needed for mocking the socket
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ModuleRef } from '@nestjs/core';
import { Socket } from 'socket.io';
import { gameStub } from './stubs/game.stub';
import { Timer } from '@app/classes/timer';
import { TimerEventType } from '@common/timer-event-type';

describe('TimerService', () => {
    let timerService: TimerService;
    let moduleRef: ModuleRef;
    let gameServiceMock: jest.Mocked<GameService>;
    let socketMock: jest.Mocked<Socket>;

    beforeEach(async () => {
        const moduleRefFactory = {
            get: jest.fn((service) => {
                if (service === GameService) return gameServiceMock;
            }),
        } as any;

        moduleRef = moduleRefFactory as ModuleRef;

        gameServiceMock = {
            getGame: jest.fn(),
            getOrganizer: jest.fn(),
        } as any as jest.Mocked<GameService>;

        timerService = new TimerService(moduleRef);
    });

    beforeAll((done) => {
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll((done) => {
        done();
    });

    it('should be defined', () => {
        expect(timerService).toBeDefined();
    });

    describe('startTimer', () => {
        it('should throw an error if the client is not the organizer', () => {
            // Mock game service to return game with different organizer ID
            const TIME = 10;
            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            gameServiceMock.getGame.mockReturnValue(gameStub());
            expect(() => timerService.startTimer(socketMock, 'somePin', TIME, TimerEventType.Question, jest.fn())).toThrow(
                "Seul l'organisateur de la partie somePin peut lancer la minuterie",
            );
        });

        it('should start the timer and return remaining time', () => {
            // Mock game service to return game with organizer ID matching client ID
            gameServiceMock.getGame.mockReturnValue(gameStub());
            const setIntervalSpy = jest.spyOn(global, 'setInterval');
            socketMock = { id: 'organizerId' } as jest.Mocked<Socket>;
            const callback = jest.fn();
            const duration = 10; // Duration in seconds

            const remainingTime = timerService.startTimer(socketMock, 'somePin', duration, TimerEventType.Question, callback);
            // Verify that the timer started and remaining time is returned
            expect(remainingTime).toEqual(duration);
            expect(setIntervalSpy).toHaveBeenCalledTimes(1);
            timerService.stopTimer(socketMock, 'somePin');
        });
    });

    describe('stopTimer', () => {
        it('should throw an error if the client is not the organizer', () => {
            const pin = 'somePin';
            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            gameServiceMock.getGame.mockReturnValue(gameStub());
            expect(() => timerService.stopTimer(socketMock, pin)).toThrow(`Seul l'organisateur de la partie ${pin} peut arrêter la minuterie`);
        });
    });

    describe('togglePauseTimer', () => {
        it('should throw an error if the client is not the organizer', () => {
            const pin = 'somePin';
            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            gameServiceMock.getOrganizer.mockReturnValue(gameStub().organizer);
            expect(() => timerService.togglePauseTimer(socketMock, pin)).toThrow(
                `Seul l'organisateur de la partie ${pin} peut mettre en pause la minuterie`,
            );
        });

        it('should pause the timer if it is running', () => {
            const pin = 'somePin';
            const organizerId = 'organizerId';

            gameServiceMock.getOrganizer.mockReturnValue({ id: organizerId } as any);
            const timerMock = { isRunning: true, pause: jest.fn() } as any as Timer;
            timerService['timers'].set(pin, timerMock);
            timerService.togglePauseTimer({ id: organizerId } as Socket, pin);

            expect(timerMock.pause).toHaveBeenCalled();
        });

        it('should start the timer if it is not running', () => {
            const pin = 'somePin';
            const organizerId = 'organizerId';

            gameServiceMock.getOrganizer.mockReturnValue({ id: organizerId } as any);
            const timerMock = { isRunning: false, start: jest.fn() } as any as Timer;
            timerService['timers'].set(pin, timerMock);
            timerService.togglePauseTimer({ id: organizerId } as Socket, pin);

            expect(timerMock.start).toHaveBeenCalled();
        });
    });

    describe('accelerateTimer', () => {
        it('should throw an error if the client is not the organizer', () => {
            const pin = 'somePin';
            const ticksPerSecond = 4;

            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            gameServiceMock.getOrganizer.mockReturnValue(gameStub().organizer);

            expect(() => timerService.accelerateTimer(socketMock, pin, ticksPerSecond)).toThrow(
                `Seul l'organisateur de la partie ${pin} peut accélérer la minuterie`,
            );
        });

        it('should set the ticks per second for the timer', () => {
            const pin = 'somePin';
            const organizerId = 'organizerId';
            const ticksPerSecond = 2;

            gameServiceMock.getOrganizer.mockReturnValue({ id: organizerId } as any);
            const timerMock = { setTicksPerSecond: jest.fn() } as any as Timer;
            timerService['timers'].set(pin, timerMock);
            timerService.accelerateTimer({ id: organizerId } as Socket, pin, ticksPerSecond);

            expect(timerMock.setTicksPerSecond).toHaveBeenCalledWith(ticksPerSecond);
        });
    });

    describe('getTimer', () => {
        it('should return the timer if it exists', () => {
            const pin = 'somePin';
            const timerMock = {} as Timer;

            timerService['timers'].set(pin, timerMock);
            const result = timerService.getTimer(pin);

            expect(result).toBe(timerMock);
        });

        it('should return null if the timer does not exist', () => {
            const pin = 'somePin';

            const result = timerService.getTimer(pin);

            expect(result).toBeNull();
        });
    });
});
