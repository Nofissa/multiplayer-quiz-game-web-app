/* eslint-disable @typescript-eslint/no-explicit-any */ // used for the socket (i only want the id here)
import { ClientPlayer } from '@app/classes/client-player';
import { Game } from '@app/classes/game';
import { qrlEvaluationStub } from '@app/tests/stubs/qrl-evaluation.stub';
import { GameState } from '@common/game-state';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { Submission } from '@common/submission';
import { clientPlayerStub } from './client.player.stub';
import { quizStub } from './quiz.stubs';
import { submissionStub } from './submission.stub';

export const gameStub = (): Game => {
    return {
        pin: '1234',
        quiz: quizStub(),
        organizer: { id: 'organizerId' } as any,
        state: GameState.Running,
        chatlogs: [],
        currentQuestionIndex: 0,
        clientPlayers: new Map<string, ClientPlayer>([['playerId', clientPlayerStub()]]),
        qcmSubmissions: [new Map<string, Submission>([['playerId', submissionStub()]])],
        qrlSubmissions: [new Map<string, QrlEvaluation>([['playerId', qrlEvaluationStub()]])],
        loadNextQuestion() {
            this.questionSubmissions.push(new Map());
            this.currentQuestionIndex++;
        },
        get currentQuestion() {
            return this.quiz.questions[this.currentQuestionIndex];
        },
        get currentQuestionQcmSubmissions() {
            return this.questionSubmissions[this.currentQuestionIndex];
        },
        get currentQuestionQrlSubmissions() {
            return this.qrlSubmissions[this.currentQuestionIndex];
        },
    };
};
