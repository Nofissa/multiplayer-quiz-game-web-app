import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistogrammeSwiperComponent } from './histogramme-swiper.component';

describe('HistogrammeSwiperComponent', () => {
    let component: HistogrammeSwiperComponent;
    let fixture: ComponentFixture<HistogrammeSwiperComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HistogrammeSwiperComponent],
        });
        fixture = TestBed.createComponent(HistogrammeSwiperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
