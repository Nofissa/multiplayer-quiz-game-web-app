import { Chatlog } from '@common/chatlog';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
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

const mockQuestionQcmSubmissions: QcmSubmission[][] = [[{ clientId: 'someId', choices: [{ payload: 0, isSelected: true }], isFinal: false }]];
const mockQuestionQrlEvaluation: QrlEvaluation[][] = [[{ player: firstPlayerStub(), grade: 50, score: 50, isLast: true }]];
const mockQuestionQrlSubmissions: QrlSubmission[][] = [[{ answer: 'hello', clientId: 'playerId' }]];

export const mockSnapshotStubs = (): GameSnapshot[] => {
    return [
        {
            players: [secondPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: quizStub(),
            state: mockState,
            currentQuestionIndex: 0,
            questionQcmSubmissions: mockQuestionQcmSubmissions,
            questionQrlSubmission: mockQuestionQrlSubmissions,
            questionQrlEvaluation: mockQuestionQrlEvaluation,
        },
        {
            players: [firstPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: quizStub(),
            state: mockState,
            currentQuestionIndex: 0,
            questionQcmSubmissions: mockQuestionQcmSubmissions,
            questionQrlSubmission: mockQuestionQrlSubmissions,
            questionQrlEvaluation: mockQuestionQrlEvaluation,
        },
        {
            players: [firstPlayerStub(), secondPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: quizStub(),
            state: mockState,
            currentQuestionIndex: 0,
            questionQcmSubmissions: mockQuestionQcmSubmissions,
            questionQrlSubmission: mockQuestionQrlSubmissions,
            questionQrlEvaluation: mockQuestionQrlEvaluation,
        },
    ];
};
