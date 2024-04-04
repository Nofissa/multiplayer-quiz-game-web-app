import { GameHistory, GameHistoryDocument } from '@app/model/database/game-history';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const ASCENDING_ORDER = 1;
const DESCENDING_ORDER = -1;

@Injectable()
export class GameHistoryService {
    constructor(@InjectModel(GameHistory.name) public model: Model<GameHistoryDocument>) {}

    async getGameHistories(): Promise<GameHistory[]> {
        return this.model.find({});
    }

    async getGameHistoriesSorted(sortField: string, orderDirection: 'asc' | 'desc'): Promise<GameHistory[]> {
        const sortObject = {};
        sortObject[sortField] = orderDirection === 'asc' ? ASCENDING_ORDER : DESCENDING_ORDER;

        try {
            return await this.model.find({}).sort(sortObject);
        } catch (error) {
            return Promise.reject('Failed to retrieve sorted game histories');
        }
    }

    async deleteAllGameHistories(): Promise<void> {
        try {
            await this.model.deleteMany({});
        } catch (error) {
            return Promise.reject('Failed to delete game histories');
        }
    }

    async saveGameHistory(gameHistory: GameHistory): Promise<GameHistory> {
        try {
            return await this.model.create(gameHistory);
        } catch (error) {
            throw new Error('Error saving game history');
        }
    }
}
