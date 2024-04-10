import { BarChartData } from '@app/interfaces/bar-chart-data';
import { qcmQuestionStub } from './question.stubs';

export const barChartDataStub = (): BarChartData[] => {
    return [
        {
            text: qcmQuestionStub()[0].text,
            chartElements: [],
            chartType: 'QCM',
            submissions: [],
        },

        {
            text: qcmQuestionStub()[1].text,
            chartElements: [],
            chartType: 'QCM',
            submissions: [],
        },
    ];
};
