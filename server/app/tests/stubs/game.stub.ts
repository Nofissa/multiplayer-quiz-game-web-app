/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientPlayer } from '@app/classes/client-player';
import { Game } from '@app/classes/game';
import { GameState } from '@common/game-state';
import { Submission } from '@common/submission';
import { clientPlayerStub } from './client.player.stub';
import { quizStub } from './quiz.stubs';
import { submissionStub } from './submission.stub';

export const gameStub = (): Game => {
    return {
        pin: '1234',
        quiz: quizStub(),
        organizer: { id: 'organizerId' } as any,
        state: GameState.Started,
        chatlogs: [],
        currentQuestionIndex: 0,
        clientPlayers: new Map<string, ClientPlayer>([['playerId', clientPlayerStub()]]),
        submissions: new Map<string, Submission>([['choice', submissionStub()]]),
    };
};
