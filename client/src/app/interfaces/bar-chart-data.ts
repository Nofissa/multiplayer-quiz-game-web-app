import { Submission } from '@common/submission';
import { Question } from './question';

export interface BarChartData {
    question: Question;
    submissions: Submission[];
}
