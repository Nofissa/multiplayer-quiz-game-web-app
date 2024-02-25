import { Component, Input } from '@angular/core';
import { HistogrammeData } from '@app/interfaces/histogram-data';

const PERCENT_MULTPLIER = 100;

@Component({
    selector: 'app-histogramme',
    templateUrl: './histogramme.component.html',
    styleUrls: ['./histogramme.component.scss'],
})
export class HistogrammeComponent {
    @Input()
    data: HistogrammeData;

    @Input()
    numberOfPlayers: number;

    adjust(playersSelected: number) {
        return Math.round((playersSelected / this.numberOfPlayers) * PERCENT_MULTPLIER);
    }
}
