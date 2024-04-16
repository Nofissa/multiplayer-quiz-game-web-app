import { GameSummaryController } from '@app/controllers/game-summary/game-summary.controller';
import { GameSummary } from '@app/model/database/game-summary';
import { GameSummaryService } from '@app/services/game-summary/game-summary.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('GameSummaryController', () => {
    let controller: GameSummaryController;
    let service: GameSummaryService;
    let mockResponse;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameSummaryController],
            providers: [
                {
                    provide: GameSummaryService,
                    useValue: {
                        getGameSummaries: jest.fn(),
                        deleteAllGameSummaries: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<GameSummaryController>(GameSummaryController);
        service = module.get<GameSummaryService>(GameSummaryService);

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
    });

    describe('getSummaries', () => {
        it('should return all game summaries successfully', async () => {
            const mockGameSummaries = [new GameSummary()];
            jest.spyOn(service, 'getGameSummaries').mockResolvedValue(mockGameSummaries);

            await controller.getSummaries(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(mockGameSummaries);
        });

        it('should handle errors when failing to retrieve game summaries', async () => {
            jest.spyOn(service, 'getGameSummaries').mockRejectedValue(new Error());

            await controller.getSummaries(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(mockResponse.send).toHaveBeenCalledWith('Summaries not found');
        });
    });

    describe('deleteAllGameSummaries', () => {
        it('should delete all game summaries successfully', async () => {
            jest.spyOn(service, 'deleteAllGameSummaries').mockResolvedValue();

            await controller.deleteAllGameSummaries(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should handle errors when failing to delete game summaries', async () => {
            jest.spyOn(service, 'deleteAllGameSummaries').mockRejectedValue(new Error());

            await controller.deleteAllGameSummaries(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(mockResponse.send).toHaveBeenCalledWith("Can't find game summaries to delete");
        });
    });
});
