import { Submission } from '@common/submission';
import { Question } from '@common/question';

export interface BarChartData {
    question: Question;
    submissions: Submission[];
}
