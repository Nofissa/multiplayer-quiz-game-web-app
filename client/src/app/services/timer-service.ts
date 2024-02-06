import { Injectable } from '@angular/core';
import { Subscription, map, take, timer } from 'rxjs';

const ONE_SECOND_IN_MS = 1000;

// timer inspired from ChatGPT and https://www.codeproject.com/Questions/5349203/How-to-make-5-minute-countdown-timer-with-rxjs-and
@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private subscription: Subscription;

    startTimer(duration: number, countdownCallback: (number: number) => void) {
        const countdown = timer(0, ONE_SECOND_IN_MS).pipe(
            take(duration + 1),
            map((secondsElapsed) => duration - secondsElapsed),
        );

        this.subscription = countdown.subscribe((secondsLeft: number) => {
            if (secondsLeft === 0) {
                this.stopTimer();
            }

            countdownCallback(secondsLeft);
        });
    }

    stopTimer() {
        if (!this.subscription?.closed) {
            this.subscription.unsubscribe();
        }
    }
}
