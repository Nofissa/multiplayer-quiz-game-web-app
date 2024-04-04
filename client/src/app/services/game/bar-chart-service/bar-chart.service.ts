import { Injectable } from '@angular/core';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { Question } from '@common/question';
import { BarchartSubmission } from '@common/barchart-submission';

@Injectable({
    providedIn: 'root',
})
export class BarChartService {
    private barChartData: BarChartData[] = [];

    addQuestion(question: Question): void {
        if (!question) {
            return;
        }
        const newBarchartData: BarChartData = {
            question,
            submissions: [],
        };
        this.barChartData.push(newBarchartData);
    }

    updateBarChartData(data: BarchartSubmission): void {
        const chartData: BarChartData | undefined = this.getCurrentQuestionData();
        if (chartData && data) {
            chartData.submissions.push(data);
        }
    }

    getCurrentQuestionData(): BarChartData | undefined {
        if (this.barChartData.length > 0) {
            return this.barChartData[this.barChartData.length - 1];
        }
        return undefined;
    }

    getAllBarChart(): BarChartData[] {
        return this.barChartData;
    }

    setData(chartData: { submissions: BarchartSubmission[][]; questions: Question[] }): void {
        this.barChartData = [];
        for (let i = 0; i < chartData.questions.length; i++) {
            const newBarChart: BarChartData = {
                question: chartData.questions[i],
                submissions: chartData.submissions[i],
            };
            this.barChartData.push(newBarChart);
        }
    }

    flushData(): void {
        this.barChartData = [];
    }
}
