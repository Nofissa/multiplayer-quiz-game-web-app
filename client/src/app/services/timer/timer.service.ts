import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(private readonly webSocketService: WebSocketService) {}

    startTimer(pin: string, eventType: TimerEventType, duration?: number) {
        this.webSocketService.emit('startTimer', { pin, eventType, duration });
    }

    onStartTimer(pin: string, callback: (payload: TimerPayload) => void): Subscription {
        return this.webSocketService.on('startTimer', applyIfPinMatches(pin, callback));
    }

    stopTimer(pin: string) {
        this.webSocketService.emit('stopTimer', { pin });
    }

    onTimerTick(pin: string, callback: (payload: TimerPayload) => void): Subscription {
        return this.webSocketService.on('timerTick', applyIfPinMatches(pin, callback));
    }
}
