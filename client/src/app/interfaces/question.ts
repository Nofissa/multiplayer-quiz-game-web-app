import { QuestionType } from '@common/question-type';
import { Choice } from '@common/choice';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: Choice[];
    lastModification: Date;
    _id: string;
}
