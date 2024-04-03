/* eslint-disable @typescript-eslint/no-explicit-any */ // needed for mocking the socket
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ModuleRef } from '@nestjs/core';
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

        gameServiceMock = { getGame: jest.fn() } as any as jest.Mocked<GameService>;

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
            expect(() => timerService.startTimer(socketMock, 'somePin', TIME, jest.fn())).toThrow(
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
            const remainingTime = timerService.startTimer(socketMock, 'somePin', duration, callback);

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

    describe('pauseTimer', () => {
        it('should throw an error if the client is not the organizer', () => {
            const pin = 'somePin';
            socketMock = { id: 'differentId' } as jest.Mocked<Socket>;
            gameServiceMock.getGame.mockReturnValue(gameStub());
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
            gameServiceMock.getGame.mockReturnValue(gameStub());
            expect(() => timerService.accelerateTimer(socketMock, pin)).toThrow(
                `Seul l'organisateur de la partie ${pin} peut accelerer la minuterie`,
            );
        });

        // TODO : to complete with additional tests
    });
});
