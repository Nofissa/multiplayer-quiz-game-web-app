import { Component, Input } from '@angular/core';
import { BarChartData } from '@app/interfaces/bar-chart-data';

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
        const playersSelected = this.data.submissions.reduce((acc, submission) => {
            submission.choices.forEach((choice) => {
                if (choice.index === index && choice.isSelected) {
                    acc++;
                }
            });

            return acc;
        }, 0);

        return Math.round((playersSelected / this.numberOfPlayers()) * PERCENT_MULTPLIER);
    }

    numberOfPlayers() {
        return this.data.submissions.length;
    }
}
