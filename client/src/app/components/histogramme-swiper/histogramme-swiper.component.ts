import { Component, Input, ViewEncapsulation } from '@angular/core';
import { HistogrammeData } from '@app/interfaces/histogram-data';
import SwiperCore, { EffectCoverflow, Navigation, Pagination } from 'swiper';

SwiperCore.use([Navigation, Pagination, EffectCoverflow]);

@Component({
    selector: 'app-histogramme-swiper',
    templateUrl: './histogramme-swiper.component.html',
    styleUrls: ['./histogramme-swiper.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class HistogrammeSwiperComponent {
    @Input()
    answers: HistogrammeData[];

    @Input()
    numberOfPlayers: number;
}
