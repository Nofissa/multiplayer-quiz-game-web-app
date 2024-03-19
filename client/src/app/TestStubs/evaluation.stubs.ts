import { Evaluation } from '@common/evaluation';
import { firstPlayerStub } from './player.stubs';

export const firstPlayerEvaluationStub = (): Evaluation => {
    return { player: firstPlayerStub(), correctAnswers: [], score: 10, isFirstCorrect: true, isLast: false };
};

export const lastPlayerEvaluationStub = (): Evaluation => {
    return { player: firstPlayerStub(), correctAnswers: [], score: 10, isFirstCorrect: true, isLast: true };
};
