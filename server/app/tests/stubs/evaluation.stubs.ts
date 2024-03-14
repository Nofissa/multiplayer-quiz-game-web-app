import { Evaluation } from '@common/evaluation';
import { firstChoiceStub } from './choices.stubs';

export const evaluationStub = (): Evaluation => {
    return {
        correctAnswers: [firstChoiceStub()[3]],
        score: 100,
        isFirstGoodEvaluation: true,
        isLastEvaluation: false,
    };
};
