import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Subscription } from 'rxjs';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(private readonly webSocketService: WebSocketService) {}

    startTimer(pin: string, duration?: number) {
        this.webSocketService.emit('startTimer', { pin, duration });
    }

    onStartTimer(pin: string, callback: (startTime: number) => void): Subscription {
        return this.webSocketService.on('startTimer', applyIfPinMatches(pin, callback));
    }

    onTimerTick(pin: string, callback: (remainingTime: number) => void): Subscription {
        return this.webSocketService.on('timerTick', applyIfPinMatches(pin, callback));
    }
}
