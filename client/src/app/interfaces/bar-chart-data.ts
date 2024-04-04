import { BarchartSubmission } from '@common/barchart-submission';
import { BarchartElement } from './barchart-element';

export interface BarChartData {
    text: string;
    chartElements: BarchartElement[];
    submissions: BarchartSubmission[];
}
