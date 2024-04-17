/* eslint-disable @typescript-eslint/no-explicit-any */ // used for the socket (i only want the id here)
import { ClientPlayer } from '@app/classes/client-player';
import { GameState } from '@common/game-state';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { clientPlayerStub } from './client.player.stub';
import { qrlEvaluationStub } from './qrl-evaluation.stub';
import { qrlSubmissionStub } from './qrl.submission.stub';
import { quizStub } from './quiz.stubs';
import { submissionStub } from './submission.stub';

// any because we're using it for only one test and we don't need the function in Game
export const randomGameStub = (): any => {
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
        isRandom: true,
        qrlEvaluations: [new Map<string, QrlEvaluation>([['playerId', qrlEvaluationStub()]])],
    };
};
