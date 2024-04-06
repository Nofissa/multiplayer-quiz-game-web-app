import { Timer } from '@app/classes/timer';
import { GameService } from '@app/services/game/game.service';
import { TimerEventType } from '@common/timer-event-type';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Subject, Subscription } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class TimerService {
    private timers: Map<string, Timer> = new Map();
    private timeoutSubjects: Map<string, Subject<TimerEventType>> = new Map();

    constructor(private readonly moduleRef: ModuleRef) {}

    get gameService(): GameService {
        return this.moduleRef.get(GameService);
    }

    // We need 4 parameters for this method
    // eslint-disable-next-line max-params
    startTimer(client: Socket, pin: string, duration: number, eventType: TimerEventType, callback: (remainingTime: number) => void): number {
        const game = this.gameService.getGame(pin);

        if (game.organizer.id !== client.id) {
            throw new Error(`Seul l'organisateur de la partie ${pin} peut lancer la minuterie`);
        }

        if (!this.timers.has(pin)) {
            this.timers.set(pin, new Timer());
        }

        const timer = this.timers.get(pin);

        timer.time = duration;
        timer.onTick((remainingTime) => {
            callback(remainingTime);

            if (remainingTime === 0) {
                this.timeoutSubjects.get(pin)?.next(eventType);
            }
        });

        return timer.start();
    }

    stopTimer(client: Socket, pin: string) {
        const game = this.gameService.getGame(pin);

        if (game.organizer.id !== client.id) {
            throw new Error(`Seul l'organisateur de la partie ${pin} peut arrêter la minuterie`);
        }

        if (!this.timers.has(pin)) {
            this.timers.set(pin, new Timer());
        }

        const timer = this.timers.get(pin);

        timer.stop();
    }

    pauseTimer(client: Socket, pin: string) {
        const game = this.gameService.getGame(pin);

        if (game.organizer.id !== client.id) {
            throw new Error(`Seul l'organisateur de la partie ${pin} peut mettre en pause la minuterie`);
        }
        // TODO : To complete with the right behavior
    }

    accelerateTimer(client: Socket, pin: string) {
        const game = this.gameService.getGame(pin);

        if (game.organizer.id !== client.id) {
            throw new Error(`Seul l'organisateur de la partie ${pin} peut accelerer la minuterie`);
        }
        // TODO : To complete with the right behavior
        return;
    }

    getTimer(pin: string): Timer | null {
        return this.timers.get(pin) || null;
    }

    onTimeout(pin: string, callback: (eventType: TimerEventType) => void): Subscription {
        const subject = this.timeoutSubjects.get(pin);

        if (subject && !subject.closed) {
            subject.unsubscribe();
            this.timeoutSubjects.delete(pin);
        }

        this.timeoutSubjects.set(pin, new Subject<TimerEventType>());

        return this.timeoutSubjects.get(pin).subscribe(callback);
    }
}
