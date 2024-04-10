import { AddGameSummaryOperator } from '@app/classes/add-game-summary-operator';
import { GameSummary, GameSummaryDocument } from '@app/model/database/game-summary';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const ASCENDING_ORDER = 1;
const DESCENDING_ORDER = -1;

@Injectable()
export class GameSummaryService {
    constructor(@InjectModel(GameSummary.name) public model: Model<GameSummaryDocument>) {}

    async getGameSummaries(): Promise<GameSummary[]> {
        return this.model.find({});
    }

    async getGameSummariesSorted(sortField: string, orderDirection: 'asc' | 'desc'): Promise<GameSummary[]> {
        const sortObject = {};
        sortObject[sortField] = orderDirection === 'asc' ? ASCENDING_ORDER : DESCENDING_ORDER;

        try {
            return await this.model.find({}).sort(sortObject);
        } catch (error) {
            return Promise.reject('Failed to retrieve sorted game summaries');
        }
    }

    async deleteAllGameSummaries(): Promise<void> {
        try {
            await this.model.deleteMany({});
        } catch (error) {
            return Promise.reject('Failed to delete game summaries');
        }
    }

    addGameSummary(): AddGameSummaryOperator {
        return new AddGameSummaryOperator(this);
    }
}
