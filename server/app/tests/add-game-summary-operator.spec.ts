import { AddGameSummaryOperator } from '@app/classes/add-game-summary-operator';
import { gameStub } from './stubs/game.stub';
import { GameSummary, GameSummaryDocument } from '@app/model/database/game-summary';
import { Model } from 'mongoose';

describe('AddGameSummaryOperator', () => {
    let addGameSummaryOperator: AddGameSummaryOperator;
    let modelMock: jest.Mocked<Model<GameSummaryDocument>>;

    beforeEach(() => {
        modelMock = {
            create: jest.fn(),
        } as never;

        addGameSummaryOperator = new AddGameSummaryOperator(modelMock);
    });

    it('should create game summary from GameSummary', async () => {
        const gameSummary = {} as GameSummary;

        await addGameSummaryOperator.fromGameSummary(gameSummary);

        expect(modelMock.create).toHaveBeenCalledWith(gameSummary);
    });

    it('should create game summary from Game', async () => {
        const game = gameStub();
        const gameSummaryMock = {
            title: game.quiz.title,
            startDate: game.startDate,
            numberOfPlayers: game.clientPlayers.size,
            bestScore: game.getHighestScore(),
        };

        await addGameSummaryOperator.fromGame(game);

        expect(modelMock.create).toHaveBeenCalledWith(gameSummaryMock);
    });

    it('should throw error when creating game summary from Game', async () => {
        const game = gameStub();
        modelMock.create.mockRejectedValueOnce(new Error('Database error'));

        await expect(addGameSummaryOperator.fromGame(game)).rejects.toThrow('Une erreur est survenue durant la sauvegarde du résumé de partie');
    });
});
