import { QuestionType } from '@common/question-type';
import { Choice } from './choice';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: Choice[];
    lastModification: Date | null;
    _id: string;
}
