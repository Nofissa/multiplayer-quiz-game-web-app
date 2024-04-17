/* eslint-disable @typescript-eslint/no-explicit-any */ // needed for mocking the socket
import { Timer } from '@app/classes/timer';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { TimerEventType } from '@common/timer-event-type';
import { ModuleRef } from '@nestjs/core';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io';
import { gameStub } from './stubs/game.stub';

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
            const TIME = 10;
            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            gameServiceMock.getGame.mockReturnValue(gameStub());
            expect(() => timerService.startTimer(socketMock, 'somePin', TIME, TimerEventType.Question, jest.fn())).toThrow(
                "Seul l'organisateur de la partie somePin peut lancer la minuterie",
            );
        });

        it('should start the timer and return remaining time', () => {
            gameServiceMock.getGame.mockReturnValue(gameStub());
            const setIntervalSpy = jest.spyOn(global, 'setInterval');
            socketMock = { id: 'organizerId' } as jest.Mocked<Socket>;
            const callback = jest.fn();
            const duration = 10;

            const remainingTime = timerService.startTimer(socketMock, 'somePin', duration, TimerEventType.Question, callback);
            expect(remainingTime).toEqual(duration);
            expect(setIntervalSpy).toHaveBeenCalledTimes(1);
            timerService.stopTimer(socketMock, 'somePin');
        });

        it('should call timeout callback on timer tick if remainingTime equals 0', () => {
            const pin = 'somePin';
            const timeoutSubject = new Subject<TimerEventType>();
            const timeoutSubjectsMock = {
                get: () => timeoutSubject,
                set: jest.fn(),
                has: () => false,
                delete: jest.fn(),
            } as any as jest.Mocked<Map<string, Subject<TimerEventType>>>;
            timerService['timeoutSubjects'] = timeoutSubjectsMock;
            gameServiceMock.getGame.mockReturnValue(gameStub());
            socketMock = { id: 'organizerId' } as jest.Mocked<Socket>;
            const timeoutCallback = jest.fn();
            const eventType = TimerEventType.Question;
            const duration = 10; // Duration in seconds
            const oneSecondInMs = 1000;

            jest.useFakeTimers();
            timerService.onTimeout(pin, timeoutCallback);
            timerService.startTimer(socketMock, pin, duration, eventType, () => {
                return;
            });
            jest.advanceTimersByTime(duration * oneSecondInMs);

            expect(timeoutCallback).toHaveBeenCalledWith(eventType);
        });
    });

    describe('stopTimer', () => {
        it('should throw an error if the client is not the organizer', () => {
            const pin = 'somePin';
            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            gameServiceMock.getGame.mockReturnValue(gameStub());
            expect(() => timerService.stopTimer(socketMock, pin)).toThrow(`Seul l'organisateur de la partie ${pin} peut arrêter la minuterie`);
        });

        it('should handle not found pin in timers', () => {
            const pin = 'somePin';
            socketMock = { id: 'organizerId' } as jest.Mocked<Socket>;
            gameServiceMock.getGame.mockReturnValue(gameStub());
            jest.spyOn(Map.prototype, 'has').mockReturnValue(false);
            const setSpy = jest.spyOn(Map.prototype, 'set');
            timerService.stopTimer(socketMock, pin);
            expect(setSpy).toHaveBeenCalled();
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

    describe('onTimeout', () => {
        it('should create a subscription to timeout subject', () => {
            const timeoutSubject = {
                subscribe: jest.fn(),
                unsubscribe: jest.fn(),
            } as any as jest.Mocked<Subject<TimerEventType>>;
            const timeoutSubjectsMock = {
                get: () => timeoutSubject,
                has: () => true,
                set: jest.fn(),
                delete: jest.fn(),
            } as any as jest.Mocked<Map<string, Subject<TimerEventType>>>;
            timerService['timeoutSubjects'] = timeoutSubjectsMock;

            timerService.onTimeout('somePin', () => {
                return;
            });

            // Disabled because it's only used for testing if it was called
            // eslint-disable-next-line deprecation/deprecation
            expect(timeoutSubject.subscribe).toHaveBeenCalled();
        });
    });
});
