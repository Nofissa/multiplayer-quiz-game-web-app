import { Choice } from './choice'

export interface Evaluation {
    correctAnswers: Choice[];
    score: number;
    isFirstGoodEvaluation: boolean;
    isLastEvaluation: boolean;
}
