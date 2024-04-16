import { Injectable } from '@angular/core';
import { TimerEvent } from '@common/timer-event-enum';
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
        this.webSocketService.emit(TimerEvent.START_TIMER_EVENT, { pin, eventType, duration });
    }

    onStartTimer(pin: string, callback: (payload: TimerPayload) => void): Subscription {
        return this.webSocketService.on(TimerEvent.START_TIMER_EVENT, applyIfPinMatches(pin, callback));
    }

    stopTimer(pin: string) {
        this.webSocketService.emit(TimerEvent.STOP_TIMER_EVENT, { pin });
    }

    onTimerTick(pin: string, callback: (payload: TimerPayload) => void): Subscription {
        return this.webSocketService.on(TimerEvent.TIMER_TICK_EVENT, applyIfPinMatches(pin, callback));
    }

    togglePauseTimer(pin: string) {
        this.webSocketService.emit(TimerEvent.TOGGLE_PAUSE_TIMER_EVENT, { pin });
    }

    onTogglePauseTimer(pin: string, callback: (isRunning: boolean) => void): Subscription {
        return this.webSocketService.on(TimerEvent.TOGGLE_PAUSE_TIMER_EVENT, applyIfPinMatches(pin, callback));
    }

    accelerateTimer(pin: string, ticksPerSecond: number) {
        this.webSocketService.emit(TimerEvent.ACCELERATE_TIMER_EVENT, { pin, ticksPerSecond });
    }

    onAccelerateTimer(pin: string, callback: () => void): Subscription {
        return this.webSocketService.on(TimerEvent.ACCELERATE_TIMER_EVENT, applyIfPinMatches(pin, callback));
    }
}
