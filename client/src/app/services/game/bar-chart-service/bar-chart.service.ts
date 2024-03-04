import { BarChartData } from '@app/interfaces/bar-chart-data';
import { Question } from '@app/interfaces/question';
import { Submission } from '@common/submission';

export class BarChartService {
    private barChartData: BarChartData[] = [];

    addQuestion(question: Question) {
        const newBarchartData: BarChartData = {
            question,
            submissions: [],
        };
        this.barChartData.push(newBarchartData);
    }

    updateBarChartData(submission: Submission[]) {
        this.barChartData[this.barChartData.length - 1].submissions = submission;
    }

    getLatestBarChart() {
        return this.barChartData[this.barChartData.length - 1];
    }

    getAllBarChart() {
        return this.barChartData;
    }
}
