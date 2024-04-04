import { BarchartSubmission } from '@common/barchart-submission';
import { Question } from '@common/question';

export interface BarChartData {
    question: Question;
    submissions: BarchartSubmission[];
}
