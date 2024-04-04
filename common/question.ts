import { QuestionType } from './question-type';
import { Choice } from './choice';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices?: Choice[];
    lastModification: Date;
    _id: string;
}
