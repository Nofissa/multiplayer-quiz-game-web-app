/* eslint-disable @typescript-eslint/no-explicit-any */ // used for the socket (i only want the id here)
import { ClientPlayer } from '@app/classes/client-player';
import { Game } from '@app/classes/game';
import { GameState } from '@common/game-state';
import { QrlSubmission } from '@common/qrl-submission';
import { QcmSubmission } from '@common/qcm-submission';
import { clientPlayerStub } from './client.player.stub';
import { qrlSubmissionStub } from './qrl.submission.stub';
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
        qcmSubmissions: [new Map<string, QcmSubmission>([['playerId', submissionStub()]])],
        qrlSubmissions: [new Map<string, QrlSubmission>([['playerId', qrlSubmissionStub()]])],
        loadNextQuestion() {
            this.qcmSubmissions.push(new Map());
            this.qrlSubmissions.push(new Map());
            this.currentQuestionIndex++;
        },
        get currentQuestion() {
            return this.quiz.questions[this.currentQuestionIndex];
        },
        get currentQuestionQcmSubmissions() {
            return this.qcmSubmissions[this.currentQuestionIndex];
        },
        get currentQuestionQrlSubmissions() {
            return this.qrlSubmissions[this.currentQuestionIndex];
        },
    };
};
