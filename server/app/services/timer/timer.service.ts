import { Injectable } from '@nestjs/common';
import { Subject, Subscription } from 'rxjs';
import { Socket } from 'socket.io';
import { GameService } from '@app/services/game/game.service';

const TICK_PER_SECOND = 1;
const ONE_SECOND_MS = 1000;

@Injectable()
export class TimerService {
    private tickSubjects: Map<string, Subject<number>> = new Map<string, Subject<number>>();
    private counters: Map<string, number> = new Map();
    private intervals: Map<string, NodeJS.Timer | undefined> = new Map();
    private tickSubscriptions: Map<string, Subscription> = new Map();

    constructor(private readonly gameService: GameService) {}

    // We need 4 parameters for this method
    // eslint-disable-next-line max-params
    startTimer(client: Socket, pin: string, duration: number, callback: (remainingTime: number) => void): number {
        const game = this.gameService.getGame(pin);

        if (game.organizer.id !== client.id) {
            throw new Error(`Seul l'organisateur de la partie ${pin} peut lancer la minuterie`);
        }

        if (this.intervals.get(pin)) {
            this.stopTimer(client, pin); // to reset the timer
        }

        if (this.counters.get(pin) === undefined) {
            this.counters.set(pin, duration);
        }

        this.tickSubjects.set(pin, new Subject());
        const interval = setInterval(this.decrement.bind(this, client, pin), ONE_SECOND_MS / TICK_PER_SECOND);

        this.intervals.set(pin, interval);
        this.tickSubscriptions.set(pin, this.tickSubjects.get(pin).subscribe(callback));

        return this.counters.get(pin);
    }

    stopTimer(client: Socket, pin: string) {
        const game = this.gameService.getGame(pin);

        if (game.organizer.id !== client.id) {
            throw new Error(`Seul l'organisateur de la partie ${pin} peut arrêter la minuterie`);
        }

        clearInterval(this.intervals.get(pin));
        this.intervals.delete(pin);
        this.counters.delete(pin);
        this.tickSubscriptions.delete(pin);
        this.tickSubjects.get(pin).unsubscribe();
    }

    private decrement(client: Socket, pin: string) {
        this.counters.set(pin, this.counters.get(pin) - 1 / TICK_PER_SECOND);
        this.tickSubjects.get(pin).next(this.counters.get(pin));
        if (this.counters.get(pin) <= 0) {
            this.stopTimer(client, pin);
        }
    }
}
