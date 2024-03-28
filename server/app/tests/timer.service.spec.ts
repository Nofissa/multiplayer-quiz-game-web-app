/* eslint-disable @typescript-eslint/no-explicit-any */ // needed for mocking the socket
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Socket } from 'socket.io';
import { gameStub } from './stubs/game.stub';

describe('TimerService', () => {
    let timerService: TimerService;
    let socketMock: jest.Mocked<Socket>;
    let gameServiceMock: jest.Mocked<GameService>;
    let quizServiceMock: jest.Mocked<QuizService>;

    beforeEach(() => {
        gameServiceMock = new GameService(quizServiceMock) as jest.Mocked<GameService>;
        timerService = new TimerService(gameServiceMock);
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
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameStub());
            expect(() => timerService.startTimer(socketMock, 'somePin', TIME, jest.fn())).toThrow(
                "Seul l'organisateur de la partie somePin peut lancer la minuterie",
            );
        });

        it('should start the timer and return remaining time', () => {
            // Mock game service to return game with organizer ID matching client ID
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameStub());
            const setIntervalSpy = jest.spyOn(global, 'setInterval');
            socketMock = { id: 'organizerId' } as jest.Mocked<Socket>;
            const callback = jest.fn();
            const duration = 10; // Duration in seconds
            const remainingTime = timerService.startTimer(socketMock, 'somePin', duration, callback);

            // Verify that the timer started and remaining time is returned
            expect(remainingTime).toEqual(duration);
            expect(setIntervalSpy).toHaveBeenCalledTimes(1);
            timerService.stopTimer(socketMock, 'somePin');
        });

        it('should reset the timer if it is already running', () => {
            const TIME = 10;
            socketMock = { id: 'organizerId' } as jest.Mocked<Socket>;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameStub());
            const setIntervalSpy = jest.spyOn(global, 'setInterval');
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

            // Call startTimer twice to simulate timer reset
            timerService.startTimer(socketMock, 'somePin', TIME, jest.fn());
            const remainingTime = timerService.startTimer(socketMock, 'somePin', TIME, jest.fn());

            // Verify that the timer is reset and remaining time is returned
            expect(remainingTime).toEqual(TIME);
            expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
            expect(setIntervalSpy).toHaveBeenCalledTimes(2);
            timerService.stopTimer(socketMock, 'somePin');
        });

        it('should call decrement the number of seconds', () => {
            jest.useFakeTimers();
            const decrementSpy = jest.spyOn(timerService as any, 'decrement');
            const TIME = 10;
            const ONE_SECOND_IN_MS = 1000;
            socketMock = { id: 'organizerId' } as jest.Mocked<Socket>;
            timerService.startTimer(socketMock, 'somePin', TIME, jest.fn());
            jest.advanceTimersByTime(TIME * ONE_SECOND_IN_MS);

            expect(decrementSpy).toHaveBeenCalledTimes(TIME);
        });
    });

    describe('stopTimer', () => {
        it('should throw an error if the client is not the organizer', () => {
            const pin = 'somePin';
            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameStub());
            expect(() => timerService.stopTimer(socketMock, pin)).toThrow(`Seul l'organisateur de la partie ${pin} peut arrêter la minuterie`);
        });
    });

    describe('pauseTimer', () => {
        it('should throw an error if the client is not the organizer', () => {
            const pin = 'somePin';
            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameStub());
            expect(() => timerService.pauseTimer(socketMock, pin)).toThrow(
                `Seul l'organisateur de la partie ${pin} peut mettre en pause la minuterie`,
            );
        });

        // TODO : to complete with additional tests
    });

    describe('accelerateTimer', () => {
        it('should throw an error if the client is not the organizer', () => {
            const pin = 'somePin';
            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameStub());
            expect(() => timerService.accelerateTimer(socketMock, pin)).toThrow(
                `Seul l'organisateur de la partie ${pin} peut accelerer la minuterie`,
            );
        });

        // TODO : to complete with additional tests
    });
});
