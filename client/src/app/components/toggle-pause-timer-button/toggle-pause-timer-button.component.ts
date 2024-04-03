import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TimerService } from '@app/services/timer/timer.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toggle-pause-timer-button',
    templateUrl: './toggle-pause-timer-button.component.html',
    styleUrls: ['./toggle-pause-timer-button.component.scss'],
})
export class TogglePauseTimerButtonComponent implements OnInit, OnDestroy {
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
