import { BarChartData } from '@app/interfaces/bar-chart-data';
import { Question } from '@app/interfaces/question';

export class BarChartService {
    numberOfPlayers: number;
    private barChartData: BarChartData[];

    addQuestion(question: Question) {
        const newBarchartData: BarChartData = {
            question,
            submissions: [],
        };
        this.barChartData.push(newBarchartData);
    }

    updateBarChartData() {
        // this.barChartData = submission.map((x) => {
        //     retunr { question: 'asl', choices: x.choices.map((choice) => {
        //         return { choice:  }
        //     }) }
        // });
        // submission[0].choices.forEach((index) => {
        //     return index;
        // });

        return null;
    }
}
