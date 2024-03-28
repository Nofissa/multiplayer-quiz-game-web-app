import { Chatlog } from '@common/chatlog';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { Submission } from '@common/submission';
import { firstPlayerStub, secondPlayerStub } from './player.stubs';
import { quizStub } from './quiz.stubs';

const mockChatlogs: Chatlog[] = [
    {
        author: 'TestAuthor',
        message: 'Test message',
        date: new Date(),
    },
];

const mockState: GameState = GameState.Opened;

const mockQuestionSubmissions: Submission[][] = [[{ choices: [{ payload: 0, isSelected: true }], isFinal: false }]];

export const mockGameSnapshot = (): GameSnapshot[] => {
    return [
        {
            players: [secondPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: quizStub(),
            state: mockState,
            currentQuestionIndex: 0,
            questionSubmissions: mockQuestionSubmissions,
        },
        {
            players: [firstPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: quizStub(),
            state: mockState,
            currentQuestionIndex: 0,
            questionSubmissions: mockQuestionSubmissions,
        },
        {
            players: [firstPlayerStub(), secondPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: quizStub(),
            state: mockState,
            currentQuestionIndex: 0,
            questionSubmissions: mockQuestionSubmissions,
        },
    ];
};
