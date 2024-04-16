import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwiperComponent } from 'swiper/angular';
import { BarChartSwiperComponent } from './bar-chart-swiper.component';

describe('HistogrammeSwiperComponent', () => {
    let component: BarChartSwiperComponent;
    let fixture: ComponentFixture<BarChartSwiperComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BarChartSwiperComponent],
            providers: [{ provide: SwiperComponent, useValue: { swiperRef: { slideTo: jasmine.createSpy() } } }],
        });
        fixture = TestBed.createComponent(BarChartSwiperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
