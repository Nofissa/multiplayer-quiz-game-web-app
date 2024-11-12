import { GameSummary, GameSummaryDocument } from '@app/model/database/game-summary';
import { Game } from './game';
import { Model } from 'mongoose';

export class AddGameSummaryOperator {
    constructor(private readonly model: Model<GameSummaryDocument>) {}

    async fromGameSummary(gameSummary: GameSummary) {
        try {
            return await this.model.create(gameSummary);
        } catch (error) {
            throw new Error('Une erreur est survenue durant la sauvegarde du résumé de partie');
        }
    }

    async fromGame(game: Game): Promise<GameSummary> {
        try {
            const numberOfPlayers = game.clientPlayers.size;
            const bestScore = game.getHighestScore();
            const gameSummary: GameSummary = {
                title: game.quiz.title,
                startDate: game.startDate,
                numberOfPlayers,
                bestScore,
            };
            return await this.fromGameSummary(gameSummary);
        } catch (error) {
            throw new Error('Une erreur est survenue durant la sauvegarde du résumé de partie');
        }
    }
}
