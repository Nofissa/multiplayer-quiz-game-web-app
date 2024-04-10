import { Chatlog } from '@common/chatlog';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { firstPlayerStub, secondPlayerStub } from './player.stubs';
import { allQuestionTypeQuiz, quizStub } from './quiz.stubs';

const mockChatlogs: Chatlog[] = [
    {
        author: 'TestAuthor',
        message: 'Test message',
        date: new Date(),
    },
];

const mockState: GameState = GameState.Opened;

const mockQuestionQcmSubmissions: QcmSubmission[][] = [[{ clientId: 'someId', choices: [{ payload: 0, isSelected: true }], isFinal: false }]];
const mockQuestionQrlEvaluation: QrlEvaluation[][] = [];
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
        {
            players: [firstPlayerStub(), secondPlayerStub()],
            chatlogs: mockChatlogs,
            quiz: allQuestionTypeQuiz(),
            state: mockState,
            currentQuestionIndex: 0,
            questionQcmSubmissions: [
                [
                    {
                        clientId: firstPlayerStub().socketId,
                        choices: [
                            { payload: 0, isSelected: true },
                            { payload: 1, isSelected: false },
                            { payload: 2, isSelected: true },
                            { payload: 3, isSelected: true },
                        ],
                    },
                    {
                        clientId: secondPlayerStub().socketId,
                        choices: [
                            { payload: 0, isSelected: true },
                            { payload: 1, isSelected: false },
                            { payload: 2, isSelected: false },
                            { payload: 3, isSelected: true },
                        ],
                    },
                ],
                [
                    {
                        clientId: firstPlayerStub().socketId,
                        choices: [
                            { payload: 0, isSelected: true },
                            { payload: 1, isSelected: false },
                            { payload: 2, isSelected: false },
                            { payload: 3, isSelected: false },
                        ],
                    },
                    {
                        clientId: secondPlayerStub().socketId,
                        choices: [
                            { payload: 0, isSelected: true },
                            { payload: 1, isSelected: false },
                            { payload: 2, isSelected: true },
                            { payload: 3, isSelected: false },
                        ],
                    },
                ],
                [],
                [],
            ],
            questionQrlSubmission: [
                [],
                [],
                [
                    {
                        clientId: firstPlayerStub().socketId,
                        answer: 'some answer',
                        isLast: false,
                    },
                    {
                        clientId: secondPlayerStub().socketId,
                        answer: 'some random answer',
                        isLast: true,
                    },
                ],
                [
                    {
                        clientId: firstPlayerStub().socketId,
                        answer: 'some other answer',
                        isLast: false,
                    },
                    {
                        clientId: secondPlayerStub().socketId,
                        answer: 'some formal answer',
                        isLast: true,
                    },
                ],
            ],
            questionQrlEvaluation: [
                [],
                [],
                [
                    {
                        player: firstPlayerStub(),
                        grade: 0,
                        isLast: false,
                    },
                    {
                        player: secondPlayerStub(),
                        grade: 50,
                        isLast: true,
                    },
                ],
                [
                    {
                        player: firstPlayerStub(),
                        grade: 100,
                        isLast: false,
                    },
                    {
                        player: secondPlayerStub(),
                        grade: 0,
                        isLast: true,
                    },
                ],
            ],
        },
    ];
};
