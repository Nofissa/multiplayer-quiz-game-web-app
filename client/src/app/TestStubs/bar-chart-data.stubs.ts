import { BarChartData } from '@app/interfaces/bar-chart-data';
import { questionStub } from './question.stubs';
import { submissionsStub } from './submission.stubs';

export const barChartDataStub = (): BarChartData[] => {
    return [
        {
            question: questionStub()[0],
            submissions: submissionsStub()[0],
        },

        {
            question: questionStub()[1],
            submissions: submissionsStub()[1],
        },
    ];
};
