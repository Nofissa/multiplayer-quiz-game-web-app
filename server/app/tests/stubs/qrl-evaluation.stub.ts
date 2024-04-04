import { Grade } from '@common/grade';
import { QrlEvaluation } from '@common/qrl-evaluation';

export const qrlEvaluationStub = (): QrlEvaluation => {
    return {
        clientId: 'playerId',
        grade: Grade.Average,
        score: 100,
        isLast: false,
    };
};
