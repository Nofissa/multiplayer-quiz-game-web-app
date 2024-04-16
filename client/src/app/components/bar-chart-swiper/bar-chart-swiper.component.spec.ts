import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwiperComponent } from 'swiper/angular';
import { BarChartSwiperComponent } from './bar-chart-swiper.component';

describe('HistogrammeSwiperComponent', () => {
    let component: BarChartSwiperComponent;
    let fixture: ComponentFixture<BarChartSwiperComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BarChartSwiperComponent],
            providers: [SwiperComponent],
        });
        fixture = TestBed.createComponent(BarChartSwiperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize swiperComponent', () => {
        const mockSwiperRef = {
            slides: [{}, {}, {}],
            slideTo: jasmine.createSpy('slideTo'),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.swiperComponent = { swiperRef: mockSwiperRef } as any;
        expect(component.swiperComponent).toBeDefined();
    });

    it('should slide to the end', () => {
        const mockSwiperRef = {
            slides: [{}, {}, {}],
            slideTo: jasmine.createSpy('slideTo'),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.swiperComponent = { swiperRef: mockSwiperRef } as any;

        component.goToEndSlide();

        expect(mockSwiperRef.slideTo).toHaveBeenCalledWith(2);
    });
});
