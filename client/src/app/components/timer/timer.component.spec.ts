import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerService } from '@app/services/timer/timer.service';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('TimerService', ['onStartTimer', 'onTimerTick']);
        TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [{ provide: TimerService, useValue: spy }],
        });
        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        timerServiceSpy = TestBed.inject(TimerService) as jasmine.SpyObj<TimerService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
