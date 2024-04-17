import { Injectable } from '@angular/core';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarchartSubmission } from '@common/barchart-submission';
import { BarChartType } from '@common/barchart-type';
import { GameSnapshot } from '@common/game-snapshot';
import { Grade } from '@common/grade';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { Question } from '@common/question';
import { QuestionType } from '@common/question-type';

@Injectable({
    providedIn: 'root',
})
export class BarChartService {
    private barChartData: BarChartData[] = [];

    addChart(question: Question, chartType?: BarChartType): void {
        if (!question) {
            return;
        }

        const newBarchartData: BarChartData = {
            text: chartType === BarChartType.ACTIVITY ? 'Activité pour la question: ' + question.text : question.text,
            chartType:
                chartType === BarChartType.ACTIVITY
                    ? BarChartType.ACTIVITY
                    : question.type === QuestionType.QCM
                    ? BarChartType.QCM
                    : BarChartType.QRL,
            chartElements: [],
            submissions: [],
        };
        switch (newBarchartData.chartType) {
            case BarChartType.QCM:
                for (const choice of question.choices ? question.choices : []) {
                    newBarchartData.chartElements.push({ text: choice.text, isCorrect: choice.isCorrect });
                }
                break;
            case BarChartType.QRL:
                Object.values(Grade)
                    .filter((x) => !isNaN(Number(x)))
                    .forEach((grade) => {
                        newBarchartData.chartElements.push({ text: `${grade}` });
                    });
                break;

            case BarChartType.ACTIVITY:
                newBarchartData.chartElements.push({ text: 'Joueurs Inactifs' });
                newBarchartData.chartElements.push({ text: 'Joueurs Actifs' });
                break;
        }

        this.barChartData.push(newBarchartData);
    }

    updateChartData(data: BarchartSubmission): void {
        const chartData: BarChartData | undefined = this.getCurrentQuestionData();
        if (chartData && data) {
            const submissionIndex = chartData.submissions.findIndex((sub) => sub.clientId === data.clientId && sub.index === data.index);
            let mirrorSubIndex = -1;
            if (chartData.chartType === BarChartType.ACTIVITY) {
                mirrorSubIndex = chartData.submissions.findIndex((sub) => sub.clientId === data.clientId && sub.index === (data.index === 1 ? 0 : 1));
            }
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
        if (submissions) {
            for (const submission of submissions) {
                for (const choice of submission.choices) {
                    newSubmissions.push({ clientId: submission.clientId, index: choice.payload, isSelected: choice.isSelected });
                }
            }
        }
        return newSubmissions;
    }

    convertQrlEvaluation(evaluations: QrlEvaluation[]): BarchartSubmission[] {
        const newSubmissions = [];
        for (const evaluation of evaluations) {
            switch (evaluation.grade) {
                case 0:
                    newSubmissions.push({ clientId: evaluation.player.socketId, index: 0, isSelected: true });
                    break;
                case Grade.Average:
                    newSubmissions.push({ clientId: evaluation.player.socketId, index: 1, isSelected: true });
                    break;
                case Grade.Good:
                    newSubmissions.push({ clientId: evaluation.player.socketId, index: 2, isSelected: true });
                    break;
            }
        }
        return newSubmissions;
    }

    setData(snapshot: GameSnapshot): void {
        this.flushData();
        for (let i = 0; i < snapshot.quiz.questions.length; i++) {
            this.addChart(snapshot.quiz.questions[i]);

            switch (snapshot.quiz.questions[i].type) {
                case QuestionType.QCM:
                    this.barChartData[i].submissions = this.convertQcmSubmissions(snapshot.questionQcmSubmissions[i]);
                    break;

                case QuestionType.QRL:
                    this.barChartData[i].submissions = this.convertQrlEvaluation(snapshot.questionQrlEvaluation[i]);
                    break;
            }
        }
    }

    flushData(): void {
        this.barChartData = [];
    }
}
