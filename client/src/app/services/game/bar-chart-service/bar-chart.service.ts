import { Injectable } from '@angular/core';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarchartSubmission } from '@common/barchart-submission';
import { GameSnapshot } from '@common/game-snapshot';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { Question } from '@common/question';

const QRL_EVALUATION_INCREMENT = 50;

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
            text: question.text,
            chartElements: [],
            submissions: [],
        };

        switch (question.type) {
            case 'QCM':
                for (const choice of question.choices ? question.choices : []) {
                    newBarchartData.chartElements.push({ text: choice.text, isCorrect: choice.isCorrect });
                }
                break;
            case 'QRL':
                for (let i = 0; i < 3; i++) {
                    newBarchartData.chartElements.push({ text: `${i * QRL_EVALUATION_INCREMENT}` });
                }
                break;
        }

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

    setQcmSubmissions(submissions: QcmSubmission[]) {
        submissions = [];
        return;
    }

    setQrlSubmissions(submissions: QrlEvaluation[]) {
        submissions = [];
        return;
    }

    setData(snapshot: GameSnapshot): void {
        this.flushData();

        let qcmId = 0;
        let qrlId = 0;
        for (const question of snapshot.quiz.questions) {
            this.addQuestion(question);
            switch (question.text) {
                case 'QCM':
                    this.setQcmSubmissions(snapshot.questionQcmSubmissions[qcmId]);
                    qcmId++;
                    break;

                case 'QRL':
                    // this.setQrlSubmissions(snapshot.questionQrlSubmission[qrlId]);
                    qrlId++;
                    break;
            }
        }
    }

    flushData(): void {
        this.barChartData = [];
    }
}
