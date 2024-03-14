import { Component, Input } from '@angular/core';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { Submission } from '@common/submission';

const PERCENT_MULTPLIER = 100;

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent {
    @Input()
    data: BarChartData;

    adjust(index: number) {
        const playersSelected = this.playersSelected(index);
        return Math.round((playersSelected / this.numberOfPlayers()) * PERCENT_MULTPLIER);
    }

    numberOfPlayers() {
        return this.data.submissions ? this.data.submissions.size : 0;
    }

    playersSelected(index: number) {
        if (!this.data.submissions) {
            return 0;
        }
        const submissionArray: Submission[] = Array.from(this.data.submissions.values());
        const playersSelected = submissionArray.reduce((totalSelections, submission) => {
            submission.choices.forEach((choice) => {
                if (choice.index === index && choice.isSelected) {
                    totalSelections++;
                }
            });

            return totalSelections;
        }, 0);

        return playersSelected;
    }
}
