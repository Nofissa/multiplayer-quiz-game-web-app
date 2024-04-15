import { AddGameSummaryOperator } from '@app/classes/add-game-summary-operator';
import { GameSummary, GameSummaryDocument } from '@app/model/database/game-summary';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameSummaryService {
    constructor(@InjectModel(GameSummary.name) public model: Model<GameSummaryDocument>) {}

    async getGameSummaries(): Promise<GameSummary[]> {
        return this.model.find().sort({ startDate: -1 });
    }

    async deleteAllGameSummaries(): Promise<void> {
        try {
            await this.model.deleteMany({});
        } catch (error) {
            throw new Error('Failed to delete game summaries');
        }
    }

    addGameSummary(): AddGameSummaryOperator {
        return new AddGameSummaryOperator(this.model);
    }
}
