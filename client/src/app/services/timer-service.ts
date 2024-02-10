import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
// import { Subscription, map, take, timer } from 'rxjs';

// const ONE_SECOND_IN_MS = 1000;

// timer inspired from ChatGPT and https://www.codeproject.com/Questions/5349203/How-to-make-5-minute-countdown-timer-with-rxjs-and
@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private onTickSubject = new Subject<number>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    onTick: Observable<number> = this.onTickSubject.asObservable();
    private interval: number | undefined;
    private readonly tick = 1000;

    private counter = 0;
    get time() {
        return this.counter;
    }
    private set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(startValue: number) {
        if (this.interval) return;
        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
                this.onTickSubject.next(this.time);
            } else {
                this.stopTimer();
            }
        }, this.tick);
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
