import { Injectable } from '@angular/core';
import * as http from 'http';
import { Observable, Subject } from 'rxjs';
import * as io from 'socket.io';
import { GameService } from '../game/game.service';

@Injectable
export class TimerService {
    private onTickSubject = new Subject<number>();
    private sio: io.Server;
    // disabled lint here because if I place it on the first line, onTickSubject would be used before its declaration
    // eslint-disable-next-line @typescript-eslint/member-ordering
    onTick: Observable<number> = this.onTickSubject.asObservable();
    private interval: number | undefined;
    private readonly tick = 1000;
    private counter = 0;
    constructor(
        server: http.Server,
        private gameService: GameService,
    ) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    get time() {
        return this.counter;
    }
    private set time(newTime: number) {
        this.counter = newTime;
    }

    handleTimer() {
        this.sio.on('connection', (socket) => {
            socket.on('startTimer', (pin: string) => {
                this.startTimer(pin);
            });
        });
    }

    private startTimer(pin: string, startValue: number) {
        if (this.interval || !this.gameService.activeGames.has(pin)) return;
        const game = this.gameService.getGame(pin);
        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.sio.to(game).emit('timerTick', this.time);
                this.time--;
                this.onTickSubject.next(this.time);
            } else {
                this.stopTimer();
            }
        }, this.tick);
    }

    private stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
