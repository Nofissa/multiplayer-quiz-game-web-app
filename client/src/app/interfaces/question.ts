import { Answer } from './answer';

export interface Question {
    _id: string;
    question: string;
    answers: Answer[];
    pointValue: number;
    answerTime: number;
    lastModified: Date;
}
