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

    adjust(index: number): number {
        const playersSelected = this.playersSelected(index);
        if (playersSelected === 0) return 0;
        return Math.round((playersSelected / this.numberOfPlayers()) * PERCENT_MULTPLIER);
    }

    numberOfPlayers(): number {
        return this.data.submissions ? this.data.submissions.length : 0;
    }

    playersSelected(index: number): number {
        if (!this.data.submissions) {
            return 0;
        }
        return this.data.submissions.filter((submission) => submission.index === index && submission.isSelected).length;
    }
}
