import { QcmSubmission } from '@common/qcm-submission';
import { Question } from '@common/question';

export interface BarChartData {
    question: Question;
    submissions: QcmSubmission[];
}
