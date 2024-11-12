/* eslint-disable @typescript-eslint/no-explicit-any */ // used for the socket (i only want the id here)
import { ClientPlayer } from '@app/classes/client-player';
import { Game } from '@app/classes/game';
import { GameState } from '@common/game-state';
import { PlayerState } from '@common/player-state';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { clientPlayerStub } from './client.player.stub';
import { qrlEvaluationStub } from './qrl-evaluation.stub';
import { qrlSubmissionStub } from './qrl.submission.stub';
import { quizStub } from './quiz.stubs';
import { submissionStub } from './submission.stub';

export const gameStub = (): Game => {
    const clientPlayers = new Map<string, ClientPlayer>([['playerId', clientPlayerStub()]]);
    return {
        pin: '1234',
        quiz: quizStub(),
        organizer: { id: 'organizerId' } as any,
        state: GameState.Running,
        chatlogs: [],
        currentQuestionIndex: 0,
        clientPlayers,
        startDate: new Date(),
        qcmSubmissions: [new Map<string, QcmSubmission>([['playerId', submissionStub()]])],
        qrlSubmissions: [new Map<string, QrlSubmission>([['playerId', qrlSubmissionStub()]])],
        isRandom: false,
        qrlEvaluations: [new Map<string, QrlEvaluation>([['playerId', qrlEvaluationStub()]])],
        getHighestScore() {
            return Math.max(...Array.from(this.clientPlayers.values()).map((clientPlayer: ClientPlayer) => clientPlayer.player.score));
        },
        loadNextQuestion() {
            this.qcmSubmissions.push(new Map());
            this.qrlSubmissions.push(new Map());
            this.qrlEvaluations.push(new Map());
            this.currentQuestionIndex++;
        },
        getActivePlayers: () => {
            return Array.from(clientPlayers.values()).filter((clientPlayer) => clientPlayer.player.state === PlayerState.Playing);
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
        get currentQuestionQrlEvaluations() {
            return this.qrlEvaluations[this.currentQuestionIndex];
        },
    };
};
