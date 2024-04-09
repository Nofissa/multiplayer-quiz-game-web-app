import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WHEEL_COLOR_COUNT } from '@app/constants/constants';
import { TimerService } from '@app/services/timer/timer.service';
import { TimerPayload } from '@common/timer-payload';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    maxDuration: number;
    remainingTime: number;
    strokeDashoffset: number = 0;
    strokeColor: string = '#63c5ea';
    private colors: [number, string][] = [
        [1 / WHEEL_COLOR_COUNT, '#63c5ea'],
        [2 / WHEEL_COLOR_COUNT, '#9cd172'],
        [3 / WHEEL_COLOR_COUNT, '#e69d2e'],
        [WHEEL_COLOR_COUNT / WHEEL_COLOR_COUNT, '#dc4d66'],
    ];
    private startTimerSubscription: Subscription = new Subscription();
    private timerTickSubscription: Subscription = new Subscription();

    constructor(private timerService: TimerService) {}

    ngOnInit() {
        this.startTimerSubscription = this.timerService.onStartTimer(this.pin, (payload: TimerPayload) => {
            this.maxDuration = payload.remainingTime;
            this.update(payload.remainingTime);
        });
        this.timerTickSubscription = this.timerService.onTimerTick(this.pin, (payload: TimerPayload) => {
            this.update(Math.max(0, payload.remainingTime));
        });
    }

    ngOnDestroy() {
        if (this.startTimerSubscription && !this.startTimerSubscription.closed) {
            this.startTimerSubscription.unsubscribe();
        }
        if (this.timerTickSubscription && !this.timerTickSubscription.closed) {
            this.timerTickSubscription.unsubscribe();
        }
    }

    private update(remainingTime: number) {
        this.remainingTime = +remainingTime.toFixed(0);

        const normalizedTime = this.maxDuration === 0 ? 1 : (this.maxDuration - remainingTime) / this.maxDuration;

        let nextRatio = 0;
        let minDifference = Infinity;

        for (const [ratio] of this.colors) {
            const difference = ratio - normalizedTime;

            if (difference > 0 && difference < minDifference) {
                minDifference = difference;
                nextRatio = ratio;
            }
        }

        const color = this.colors.find(([ratio]) => ratio === nextRatio)?.[1];
        if (color) {
            this.strokeColor = color;
        }

        this.strokeDashoffset = normalizedTime;
    }
}
