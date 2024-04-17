import { GameAutopilotService } from '@app/services/game-autopilot/game-autopilot.service';
import { ModuleRef } from '@nestjs/core';
import { Socket } from 'socket.io';
import { GameAutopilot } from '@app/classes/game-autopilot';
jest.mock('@app/classes/game-autopilot'); // to mock GameAutopilot constructor

describe('GameAutopilotService', () => {
    let gameAutopilotService: GameAutopilotService;
    let moduleRefMock: jest.Mocked<ModuleRef>;
    let gameAutopilotMock: jest.Mocked<GameAutopilot>;
    let clientMock: jest.Mocked<Socket>;

    beforeEach(() => {
        moduleRefMock = {
            get: jest.fn(),
        } as never;
        gameAutopilotMock = {
            run: jest.fn(),
            stop: jest.fn(),
        } as never;
        clientMock = {} as jest.Mocked<Socket>;
        jest.spyOn(GameAutopilot.prototype, 'run').mockImplementation(gameAutopilotMock.run);
        jest.spyOn(GameAutopilot.prototype, 'stop').mockImplementation(gameAutopilotMock.stop);

        gameAutopilotService = new GameAutopilotService(moduleRefMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('runGame', () => {
        it('should create a new GameAutopilot and run it', () => {
            gameAutopilotService.runGame(clientMock, 'mockedPin');

            expect(GameAutopilot).toHaveBeenCalledWith(moduleRefMock, clientMock, 'mockedPin');
            expect(gameAutopilotMock.run).toHaveBeenCalled();
        });
    });

    describe('stopGame', () => {
        it('should stop the GameAutopilot and remove it from the map', () => {
            gameAutopilotService.gameAutopilots.set('mockedPin', gameAutopilotMock);

            gameAutopilotService.stopGame('mockedPin');

            expect(gameAutopilotMock.stop).toHaveBeenCalled();
            expect(gameAutopilotService.gameAutopilots.size).toBe(0);
        });

        it('should handle stopping non-existent GameAutopilot', () => {
            gameAutopilotService.stopGame('nonExistentPin');

            expect(gameAutopilotMock.stop).not.toHaveBeenCalled();
            expect(gameAutopilotService.gameAutopilots.size).toBe(0);
        });
    });
});
