import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/condition-applications/conditional-applications';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(private readonly webSocketService: WebSocketService) {}

    startTimer(pin: string) {
        this.webSocketService.emit('startTimer', { pin });
    }

    onStartTimer(pin: string, callback: (startTime: number) => void): Subscription {
        return this.webSocketService.on('startTimer', applyIfPinMatches(pin, callback));
    }

    onTimerTick(pin: string, callback: (remainingTime: number) => void): Subscription {
        return this.webSocketService.on('timerTick', applyIfPinMatches(pin, callback));
    }
}
