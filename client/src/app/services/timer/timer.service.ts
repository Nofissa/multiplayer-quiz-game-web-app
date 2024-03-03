import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(private readonly webSocketService: WebSocketService) {}

    startTimer(pin: string) {
        this.webSocketService.emit('startTimer', { pin });
    }

    onStartTimer(callback: (duration: number) => void): Subscription {
        return this.webSocketService.on('startTimer', callback);
    }

    onTimerTick(callback: (remainingSeconds: number) => void): Subscription {
        return this.webSocketService.on('timerTick', callback);
    }

    pauseTimer() {
        // clearInterval(this.interval);
        // this.interval = undefined;
    }
}
