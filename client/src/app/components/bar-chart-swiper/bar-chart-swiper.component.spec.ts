import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChartSwiperComponent } from './bar-chart-swiper.component';

describe('HistogrammeSwiperComponent', () => {
    let component: BarChartSwiperComponent;
    let fixture: ComponentFixture<BarChartSwiperComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BarChartSwiperComponent],
        });
        fixture = TestBed.createComponent(BarChartSwiperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
