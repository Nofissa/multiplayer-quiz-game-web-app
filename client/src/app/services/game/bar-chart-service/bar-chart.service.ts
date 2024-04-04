import { Injectable } from '@angular/core';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarchartSubmission } from '@common/barchart-submission';
import { Question } from '@common/question';

@Injectable({
    providedIn: 'root',
})
export class BarChartService {
    private barChartData: BarChartData[] = [];

    addQuestion(question: Question): void {
        if (!question) {
            return;
        }
        const chartElements = [];
        if (question.choices) {
            for (const choice of question.choices) {
                chartElements.push({ text: choice.text, isCorrect: choice.isCorrect });
            }
        }
        const newBarchartData: BarChartData = {
            text: question.text,
            chartElements,
            submissions: [],
        };
        this.barChartData.push(newBarchartData);
    }

    updateBarChartData(data: BarchartSubmission): void {
        const chartData: BarChartData | undefined = this.getCurrentQuestionData();
        if (chartData && data) {
            const submissionIndex = chartData.submissions.findIndex((sub) => sub.clientId === data.clientId && sub.index === data.index);
            if (submissionIndex >= 0) {
                chartData.submissions[submissionIndex] = data;
            } else {
                chartData.submissions.push(data);
            }
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
                text: chartData.questions[i].text,
                chartElements: [],
                submissions: chartData.submissions[i],
            };
            this.barChartData.push(newBarChart);
        }
    }

    flushData(): void {
        this.barChartData = [];
    }
}
