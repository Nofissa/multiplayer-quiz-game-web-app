import { Subject, Subscription } from 'rxjs';
import { Socket } from 'socket.io';
import { Game } from '@app/classes/game';

export class TimerService {
    private onTickSubject = new Subject<number>();
    private readonly tick = 1000;
    private counters: Map<string, number> = new Map();
    private intervals: Map<string, NodeJS.Timer | undefined> = new Map();
    private tickSubscriptions: Map<string, Subscription> = new Map();

    startTimer(client: Socket, game: Game, callback: (remainingTime: number) => void): number {
        const pin = game.pin;

        if (game.organizer.id !== client.id) {
            throw new Error(`Seul l'organisateur de la partie ${pin} peut lancer la minuterie`);
        }

        if (this.intervals.get(pin)) {
            throw new Error(`La partie ${pin} a déjà une minuterie lancée`);
        }

        if (this.counters.get(pin) === undefined) {
            this.counters.set(pin, game.quiz.duration);
        }

        const interval = setInterval(() => {
            if (this.counters.get(pin) > 0) {
                this.counters.set(pin, this.counters.get(pin) - 1);
                this.onTickSubject.next(this.counters.get(pin));
            } else {
                this.stopTimer(pin);
            }
        }, this.tick);

        this.intervals.set(pin, interval);
        this.tickSubscriptions.set(pin, this.onTickSubject.subscribe(callback));

        return this.counters.get(pin);
    }

    stopTimer(pin: string) {
        clearInterval(this.intervals.get(pin));
        this.intervals.delete(pin);
        this.counters.delete(pin);
        this.tickSubscriptions.delete(pin);
    }
}
