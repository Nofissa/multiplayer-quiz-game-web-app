import { BarChartData } from '@app/interfaces/bar-chart-data';
import { questionStub } from './question.stubs';
import { submissionMapStub } from './submission.stubs';

export const barChartDataStub = (): BarChartData[] => {
    return [
        {
            question: questionStub()[0],
            submissions: submissionMapStub()[0],
        },

        {
            question: questionStub()[1],
            submissions: submissionMapStub()[1],
        },
    ];
};
