import { BarChartData } from '@app/interfaces/bar-chart-data';
import { qcmQuestionStub } from './question.stubs';
import { submissionsStub } from './submission.stubs';

export const barChartDataStub = (): BarChartData[] => {
    return [
        {
            question: qcmQuestionStub()[0],
            submissions: submissionsStub()[0],
        },

        {
            question: qcmQuestionStub()[1],
            submissions: submissionsStub()[1],
        },
    ];
};
