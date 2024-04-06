import { Subject, Subscription } from 'rxjs';

const ONE_SECOND_MS = 1000;

export class Timer {
    time: number;

    private tickSubject: Subject<number>;
    private tickSubscription: Subscription | null;
    private interval: NodeJS.Timer | undefined;
    private ticksPerSecond: number = 1;

    constructor() {
        this.tickSubject = new Subject();
    }

    get isRunning(): boolean {
        return this.interval && !this.interval['_destroyed'];
    }

    setTicksPerSecond(tickPerSecond: number) {
        if (tickPerSecond <= 0) {
            throw new Error('Le nombre de tic par seconde doit être un nombre strictement positif');
        }

        this.ticksPerSecond = tickPerSecond;

        if (this.isRunning) {
            this.restart();
        }
    }

    start() {
        if (this.isRunning) {
            return;
        }

        this.interval = setInterval(this.decrement.bind(this), ONE_SECOND_MS / this.ticksPerSecond);
    }

    pause() {
        clearInterval(this.interval);
    }

    stop() {
        clearInterval(this.interval);

        this.time = 0;
        this.ticksPerSecond = 1;

        if (this.tickSubscription && !this.tickSubscription.closed) {
            this.tickSubscription.unsubscribe();
        }
    }

    onTick(callback: (remainingTime: number) => void) {
        if (this.tickSubscription && !this.tickSubscription.closed) {
            this.tickSubscription.unsubscribe();
        }

        this.tickSubscription = this.tickSubject.subscribe(callback);
    }

    restart() {
        clearInterval(this.interval);
        this.start();
    }

    private decrement() {
        this.time--;
        this.tickSubject.next(this.time);

        if (this.time === 0) {
            this.stop();
        }
    }
}
