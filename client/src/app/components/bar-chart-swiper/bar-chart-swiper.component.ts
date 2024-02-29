import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BarChartData } from '@app/interfaces/histogram-data';
import SwiperCore, { EffectCoverflow, Navigation, Pagination } from 'swiper';

SwiperCore.use([Navigation, Pagination, EffectCoverflow]);

@Component({
    selector: 'app-histogramme-swiper',
    templateUrl: './bar-chart-swiper.component.html',
    styleUrls: ['./bar-chart-swiper.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class BarChartSwiperComponent {
    @Input()
    answers: BarChartData[];

    @Input()
    numberOfPlayers: number;
}
