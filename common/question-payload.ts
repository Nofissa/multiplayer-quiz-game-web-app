import { Question } from './question';

export interface QuestionPayload {
    question: Question;
    isLast: boolean;
}
