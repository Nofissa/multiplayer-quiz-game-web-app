import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { TimerEvent } from '@common/timer-event';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(private readonly webSocketService: WebSocketService) {}

    startTimer(pin: string, eventType: TimerEventType, duration?: number) {
        this.webSocketService.emit(TimerEvent.StartTimer, { pin, eventType, duration });
    }

    onStartTimer(pin: string, callback: (payload: TimerPayload) => void): Subscription {
        return this.webSocketService.on(TimerEvent.StartTimer, applyIfPinMatches(pin, callback));
    }

    stopTimer(pin: string) {
        this.webSocketService.emit(TimerEvent.StopTimer, { pin });
    }

    onTimerTick(pin: string, callback: (payload: TimerPayload) => void): Subscription {
        return this.webSocketService.on(TimerEvent.TimerTick, applyIfPinMatches(pin, callback));
    }

    togglePauseTimer(pin: string) {
        this.webSocketService.emit(TimerEvent.TogglePauseTimer, { pin });
    }

    onTogglePauseTimer(pin: string, callback: (isRunning: boolean) => void): Subscription {
        return this.webSocketService.on(TimerEvent.TogglePauseTimer, applyIfPinMatches(pin, callback));
    }

    accelerateTimer(pin: string, ticksPerSecond: number) {
        this.webSocketService.emit(TimerEvent.AccelerateTimer, { pin, ticksPerSecond });
    }

    onAccelerateTimer(pin: string, callback: () => void): Subscription {
        return this.webSocketService.on(TimerEvent.AccelerateTimer, applyIfPinMatches(pin, callback));
    }
}
