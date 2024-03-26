import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import SwiperCore, { EffectCoverflow, Navigation, Pagination } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

SwiperCore.use([Navigation, Pagination, EffectCoverflow]);

@Component({
    selector: 'app-bar-chart-swiper',
    templateUrl: './bar-chart-swiper.component.html',
    styleUrls: ['./bar-chart-swiper.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class BarChartSwiperComponent {
    @ViewChild(SwiperComponent) swiperComponent: SwiperComponent;

    @Input()
    data: BarChartData[];

    @Input()
    numberOfPlayers: number;

    goToNextSlide(): void {
        if (this.swiperComponent && this.swiperComponent.swiperRef) {
            this.swiperComponent.swiperRef.slideNext();
        }
    }
}
