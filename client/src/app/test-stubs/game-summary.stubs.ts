import { GameSummary } from '@app/interfaces/game-summary';

export const gameSummaryStub: GameSummary = {
    _id: 'testId',
    title: 'Test Quiz',
    startDate: new Date(),
    numberOfPlayers: 5,
    bestScore: 100,
};

export const gameSummariesStub: GameSummary[] = [
    { _id: 'testId', title: 'Game A', startDate: new Date('2023-01-01'), numberOfPlayers: 2, bestScore: 300 },
    { _id: 'testId', title: 'Game B', startDate: new Date('2023-01-02'), numberOfPlayers: 3, bestScore: 200 },
    { _id: 'testId', title: 'Game C', startDate: new Date('2023-01-03'), numberOfPlayers: 4, bestScore: 100 },
];
