import { Grade } from '@common/grade';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { playerstub } from './player.stub';

export const qrlEvaluationStub = (): QrlEvaluation => {
    return {
        player: playerstub(),
        grade: Grade.Average,
        score: 100,
        isLast: false,
    };
};
