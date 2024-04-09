import { Injectable } from '@angular/core';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarchartSubmission } from '@common/barchart-submission';
import { BarChartType } from '@common/barchart-type';
import { GameSnapshot } from '@common/game-snapshot';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { Question } from '@common/question';

const QRL_EVALUATION_INCREMENT_50 = 50;
const QRL_EVALUATION_INCREMENT_100 = 100;

@Injectable({
    providedIn: 'root',
})
export class BarChartService {
    private barChartData: BarChartData[] = [];

    addQuestion(question: Question, chartType?: BarChartType): void {
        if (!question) {
            return;
        }
        const newBarchartData: BarChartData = {
            text: chartType === 'ACTIVITY' ? 'Activité pour la question: ' + question.text : question.text,
            chartType: chartType ? chartType : question.type,
            chartElements: [],
            submissions: [],
        };

        switch (newBarchartData.chartType) {
            case 'QCM':
                for (const choice of question.choices ? question.choices : []) {
                    newBarchartData.chartElements.push({ text: choice.text, isCorrect: choice.isCorrect });
                }
                break;
            case 'QRL':
                for (let i = 0; i < 3; i++) {
                    newBarchartData.chartElements.push({ text: `${i * QRL_EVALUATION_INCREMENT_50}` });
                }
                break;

            case 'ACTIVITY':
                newBarchartData.chartElements.push({ text: 'innactif' });
                newBarchartData.chartElements.push({ text: 'actif' });
                break;
        }

        this.barChartData.push(newBarchartData);
    }

    updateActivityChartData(data: BarchartSubmission): void {
        const chartData: BarChartData | undefined = this.getCurrentQuestionData();
        if (chartData && data) {
            const submissionIndex = chartData.submissions.findIndex((sub) => sub.clientId === data.clientId && sub.index === data.index);
            const mirrorSubIndex = chartData.submissions.findIndex(
                (sub) => sub.clientId === data.clientId && sub.index === (data.index === 1 ? 0 : 1),
            );
            if (submissionIndex >= 0) {
                chartData.submissions[submissionIndex] = data;
            } else {
                chartData.submissions.push(data);
            }
            if (mirrorSubIndex >= 0) {
                chartData.submissions[mirrorSubIndex].isSelected = !data.isSelected;
            }
        }
    }

    updateQcmChartData(data: BarchartSubmission): void {
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

    convertQcmSubmissions(submissions: QcmSubmission[]): BarchartSubmission[] {
        const newSubmissions = [];
        for (const submission of submissions) {
            for (const choice of submission.choices) {
                newSubmissions.push({ clientId: submission.clientId, index: choice.payload, isSelected: choice.isSelected });
            }
        }
        return newSubmissions;
    }

    convertQrlEvaluation(evaluations: QrlEvaluation[]) {
        const newSubmissions = [];
        for (const evaluation of evaluations) {
            switch (evaluation.grade) {
                case 0:
                    newSubmissions.push({ clientId: evaluation.player.socketId, index: 0, isSelected: true });
                    break;
                case QRL_EVALUATION_INCREMENT_50:
                    newSubmissions.push({ clientId: evaluation.player.socketId, index: 1, isSelected: true });
                    break;
                case QRL_EVALUATION_INCREMENT_100:
                    newSubmissions.push({ clientId: evaluation.player.socketId, index: 2, isSelected: true });
                    break;
            }
        }
        return newSubmissions;
    }

    setData(snapshot: GameSnapshot): void {
        this.flushData();
        let qcmId = 0;
        let qrlId = 0;
        for (const question of snapshot.quiz.questions) {
            this.addQuestion(question);
            switch (question.type) {
                case 'QCM':
                    this.barChartData[qcmId + qrlId].submissions = this.convertQcmSubmissions(snapshot.questionQcmSubmissions[qcmId]);
                    qcmId++;
                    break;

                case 'QRL':
                    this.barChartData[qcmId + qrlId].submissions = this.convertQrlEvaluation(snapshot.questionQrlEvaluation[qrlId]);
                    qrlId++;
                    break;
            }
        }
    }

    flushData(): void {
        this.barChartData = [];
    }
}
