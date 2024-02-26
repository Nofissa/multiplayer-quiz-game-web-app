import { Choice } from './choice'

export interface EvaluationPayload {
    correctAnswers: Choice[];
    score: number;
    isFirstGoodEvaluation: boolean;
    isLastEvaluation: boolean;
}
