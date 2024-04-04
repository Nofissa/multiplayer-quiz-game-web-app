import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TimerService } from '@app/services/timer/timer.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-timer-pause-toggle',
    templateUrl: './timer-pause-toggle.component.html',
    styleUrls: ['./timer-pause-toggle.component.scss'],
})
export class TimerPauseToggleComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;

    isVisible: boolean = false;
    isRunning: boolean = true;

    private subscriptions: Subscription[] = [];

    constructor(private readonly timerService: TimerService) {}

    ngOnInit() {
        this.subscribeToTimerEvents();
    }

    ngOnDestroy() {
        this.unsubscribeAll();
    }

    togglePause() {
        this.timerService.togglePauseTimer(this.pin);
    }

    private subscribeToTimerEvents() {
        this.subscriptions.push(
            this.timerService.onStartTimer(this.pin, () => {
                this.isVisible = true;
            }),
            this.timerService.onTimerTick(this.pin, ({ remainingTime }) => {
                this.isVisible = !!remainingTime;
            }),
            this.timerService.onTogglePauseTimer(this.pin, (isRunning) => {
                this.isRunning = isRunning;
            }),
        );
    }

    private unsubscribeAll() {
        this.subscriptions.forEach((sub) => {
            if (sub && !sub.closed) {
                sub.unsubscribe();
            }
        });
    }
}
