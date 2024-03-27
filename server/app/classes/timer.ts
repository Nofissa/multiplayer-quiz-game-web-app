import { Subject, Subscription } from 'rxjs';

const ONE_SECOND_MS = 1000;

export class Timer {
    time: number;

    private tickSubject: Subject<number>;
    private tickSubscription: Subscription;
    private interval: NodeJS.Timer | undefined;
    private tickPerSecond: number = 1;

    constructor() {
        this.tickSubject = new Subject();
    }

    setTickPerSecond(tickPerSecond: number) {
        if (tickPerSecond <= 0) {
            throw new Error('Le nombre de tick par seconde doit être un nombre strictement positif');
        }

        this.tickPerSecond = tickPerSecond;
    }

    start() {
        this.interval = setInterval(this.decrement.bind(this), ONE_SECOND_MS / this.tickPerSecond);

        return this.time;
    }

    stop() {
        clearInterval(this.interval);

        this.time = 0;

        if (!this.tickSubscription.closed) {
            this.tickSubscription.unsubscribe();
        }
    }

    onTick(callback: (remainingTime: number) => void) {
        this.tickSubscription = this.tickSubject.subscribe(callback);
    }

    private decrement() {
        this.time--;
        this.tickSubject.next(this.time);

        if (this.time === 0) {
            this.stop();
        }
    }
}
