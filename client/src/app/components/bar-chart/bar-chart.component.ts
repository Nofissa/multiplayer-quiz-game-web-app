import { Component, Input } from '@angular/core';
import { PERCENT_MULTPLIER } from '@app/constants/constants';
import { BarChartData } from '@app/interfaces/bar-chart-data';

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
        return playersSelected === 0 ? 0 : Math.round((playersSelected / this.numberOfPlayers()) * PERCENT_MULTPLIER);
    }

    numberOfPlayers(): number {
        const idArray: string[] = [...new Set(this.data.submissions.map((sub) => sub.clientId))];
        return idArray.length;
    }

    playersSelected(index: number): number {
        if (!this.data.submissions) {
            return 0;
        }
        return this.data.submissions.filter((submission) => submission.index === index).reduce((acc, sub) => (sub.isSelected ? acc + 1 : acc), 0);
    }
}
