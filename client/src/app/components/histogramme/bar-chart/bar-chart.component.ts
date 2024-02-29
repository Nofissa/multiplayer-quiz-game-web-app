import { Component, Input } from '@angular/core';
import { BarChartData } from '@app/interfaces/histogram-data';

const PERCENT_MULTPLIER = 100;

@Component({
    selector: 'app-histogramme',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent {
    @Input()
    data: BarChartData;

    @Input()
    numberOfPlayers: number;

    adjust(playersSelected: number) {
        return Math.round((playersSelected / this.numberOfPlayers) * PERCENT_MULTPLIER);
    }
}
