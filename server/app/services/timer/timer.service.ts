import { Timer } from '@app/classes/timer';
import { GameService } from '@app/services/game/game.service';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Socket } from 'socket.io';

@Injectable()
export class TimerService {
    private timers: Map<string, Timer> = new Map();

    constructor(private readonly moduleRef: ModuleRef) {}

    get gameService(): GameService {
        return this.moduleRef.get(GameService);
    }

    // We need 4 parameters for this method
    // eslint-disable-next-line max-params
    startTimer(client: Socket, pin: string, duration: number, callback: (remainingTime: number) => void): number {
        const game = this.gameService.getGame(pin);

        if (game.organizer.id !== client.id) {
            throw new Error(`Seul l'organisateur de la partie ${pin} peut lancer la minuterie`);
        }

        if (!this.timers.has(pin)) {
            this.timers.set(pin, new Timer());
        }

        const timer = this.timers.get(pin);

        timer.time = duration;
        timer.onTick(callback);

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
}
