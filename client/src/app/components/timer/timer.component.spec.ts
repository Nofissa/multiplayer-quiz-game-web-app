import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimerService } from '@app/services/timer/timer.service';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [TimerService],
        });
        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update secondsLeft on tick', fakeAsync(() => {
        const duration = 10;
        const expectedSecondsLeft = 5;
        const FIVE_SECONDS_MS = 5000;

        component.startTimer(duration);
        tick(FIVE_SECONDS_MS);

        expect(component.remainingTime).toEqual(expectedSecondsLeft);
        component.stopTimer();
    }));

    it('should start the timer', () => {
        const timerService = TestBed.inject(TimerService);
        const duration = 10;

        component.startTimer(duration);

        expect(timerService['interval']).toBeDefined();
    });

    it('should stop the timer', () => {
        const timerService = TestBed.inject(TimerService);

        component.stopTimer();

        expect(timerService['interval']).toBeUndefined();
    });

    it('should pause the timer', () => {
        const timerService = TestBed.inject(TimerService);

        component.pauseTimer();

        expect(timerService['interval']).toBeUndefined();
    });
});
