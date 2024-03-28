import { QcmEvaluation } from '@common/qcm-evaluation';
import { firstPlayerStub } from './player.stubs';

export const firstPlayerEvaluationStub = (): QcmEvaluation => {
    return { player: firstPlayerStub(), correctAnswers: [], score: 10, isFirstCorrect: true, isLast: false };
};

export const lastPlayerEvaluationStub = (): QcmEvaluation => {
    return { player: firstPlayerStub(), correctAnswers: [], score: 10, isFirstCorrect: true, isLast: true };
};
