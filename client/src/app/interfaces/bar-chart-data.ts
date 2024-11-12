import { BarchartSubmission } from '@common/barchart-submission';
import { BarchartElement } from './barchart-element';
import { BarChartType } from '@common/barchart-type';

export interface BarChartData {
    text: string;
    chartType: BarChartType;
    chartElements: BarchartElement[];
    submissions: BarchartSubmission[];
}
