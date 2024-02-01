import { QuestionType } from '../../../../common/question-type';
import { choice } from './choice';

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices: choice[];
    lastModification: Date | null;
    _id: string;
}
