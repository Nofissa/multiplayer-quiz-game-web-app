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

    onTimerTick(callback: (remainingSeconds: number) => void): Subscription {
        return this.webSocketService.on('timerTick', callback);
    }
}
