import { AddGameSummaryOperator } from '@app/classes/add-game-summary-operator';
import { GameSummaryDocument } from '@app/model/database/game-summary';
import { GameSummaryService } from '@app/services/game-summary/game-summary.service';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

const mockSummaries = [{ startDate: '2021-01-01' }, { startDate: '2021-01-02' }];

describe('GameSummaryService', () => {
    let service: GameSummaryService;
    let model: Model<GameSummaryDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameSummaryService,
                {
                    provide: getModelToken('GameSummary'),
                    useValue: {
                        find: jest.fn().mockReturnThis(),
                        sort: jest.fn().mockResolvedValue(mockSummaries),
                        deleteMany: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<GameSummaryService>(GameSummaryService);
        model = module.get<Model<GameSummaryDocument>>(getModelToken('GameSummary'));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return an array of game summaries', async () => {
        const result = await service.getGameSummaries();
        expect(model.find).toHaveBeenCalled();
        expect(result).toEqual(mockSummaries);
    });

    it('should handle errors when deleting game summaries', async () => {
        const errorMessage = 'Failed to delete';
        (model.deleteMany as jest.Mock).mockRejectedValue(new Error(errorMessage));
        await expect(service.deleteAllGameSummaries()).rejects.toThrow('Failed to delete game summaries');
    });

    it('should return an instance of AddGameSummaryOperator', () => {
        const operator = service.addGameSummary();
        expect(operator).toBeInstanceOf(AddGameSummaryOperator);
        expect(operator).toEqual(new AddGameSummaryOperator(service.model));
    });
});
