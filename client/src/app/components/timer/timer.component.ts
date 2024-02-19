import { Component } from '@angular/core';
import { TimerService } from '@app/services/timer/timer.service';

@Component({
    selector: 'app-timer-component',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
    secondsLeft: number;

    constructor(private timerService: TimerService) {}

    startTimer(duration: number) {
        this.timerService.startTimer(duration);
        if (this.timerService.onTick) {
            this.timerService.onTick.subscribe(() => {
                this.secondsLeft = this.timerService.time;
            });
        }
    }

    stopTimer() {
        this.timerService.stopTimer();
    }

    pauseTimer() {
        this.timerService.pauseTimer();
    }
}
