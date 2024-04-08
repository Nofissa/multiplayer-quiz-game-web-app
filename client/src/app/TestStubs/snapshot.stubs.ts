import { Chatlog } from '@common/chatlog';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlSubmission } from '@common/qrl-submission';
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

const mockQuestionQcmSubmissions: QcmSubmission[][] = [[{ choices: [{ payload: 0, isSelected: true }], isFinal: false }]];
const mockQuestionQrlSubmissions: QrlSubmission[][] = [[{ answer: 'hello', clientId: 'playerId' }]];

export const mockGameSnapshot = (): GameSnapshot[] => {
    return [
        {
            players: [secondPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: quizStub(),
            state: mockState,
            currentQuestionIndex: 0,
            questionQcmSubmissions: mockQuestionQcmSubmissions,
            questionQrlSubmission: mockQuestionQrlSubmissions,
        },
        {
            players: [firstPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: quizStub(),
            state: mockState,
            currentQuestionIndex: 0,
            questionQcmSubmissions: mockQuestionQcmSubmissions,
            questionQrlSubmission: mockQuestionQrlSubmissions,
        },
        {
            players: [firstPlayerStub(), secondPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: quizStub(),
            state: mockState,
            currentQuestionIndex: 0,
            questionQcmSubmissions: mockQuestionQcmSubmissions,
            questionQrlSubmission: mockQuestionQrlSubmissions,
        },
    ];
};
