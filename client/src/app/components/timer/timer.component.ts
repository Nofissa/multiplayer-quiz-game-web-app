import { Component, OnDestroy, OnInit } from '@angular/core';
import { TimerService } from '@app/services/timer/timer.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-timer-component',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
    secondsLeft: number;
    private timerTickSubscription: Subscription;
    private startTimerSubscription: Subscription;

    constructor(private timerService: TimerService) {}

    ngOnInit() {
        this.startTimerSubscription = this.timerService.onStartTimer((duration: number) => {
            this.secondsLeft = duration;
        });
        this.timerTickSubscription = this.timerService.onTimerTick((remainingSeconds: number) => {
            this.secondsLeft = remainingSeconds;
        });
    }

    ngOnDestroy() {
        if (!this.timerTickSubscription.closed) {
            this.timerTickSubscription.unsubscribe();
        }
        if (!this.startTimerSubscription.closed) {
            this.startTimerSubscription.unsubscribe();
        }
    }
}
