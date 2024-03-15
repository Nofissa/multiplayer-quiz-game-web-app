import { Evaluation } from '@common/evaluation';
import { firstChoiceStub } from './choices.stubs';
import { playerstub } from './player.stub';

export const evaluationStub = (): Evaluation => {
    return {
        player: playerstub(),
        correctAnswers: [firstChoiceStub()[3]],
        score: 100,
        isFirstCorrect: true,
        isLast: false,
    };
};
