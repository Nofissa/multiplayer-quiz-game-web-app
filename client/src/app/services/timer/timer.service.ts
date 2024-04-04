import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Subscription } from 'rxjs';

const START_TIMER_EVENT = 'startTimer';
const STOP_TIMER_EVENT = 'stopTimer';
const TIMER_TICK_EVENT = 'timerTick';
const TOGGLE_PAUSE_TIMER_EVENT = 'togglePauseTimer';
const ACCELERATE_TIMER_EVENT = 'accelerateTimer';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(private readonly webSocketService: WebSocketService) {}

    startTimer(pin: string, eventType: TimerEventType, duration?: number) {
        this.webSocketService.emit(START_TIMER_EVENT, { pin, eventType, duration });
    }

    onStartTimer(pin: string, callback: (payload: TimerPayload) => void): Subscription {
        return this.webSocketService.on(START_TIMER_EVENT, applyIfPinMatches(pin, callback));
    }

    stopTimer(pin: string) {
        this.webSocketService.emit(STOP_TIMER_EVENT, { pin });
    }

    onTimerTick(pin: string, callback: (payload: TimerPayload) => void): Subscription {
        return this.webSocketService.on(TIMER_TICK_EVENT, applyIfPinMatches(pin, callback));
    }

    togglePauseTimer(pin: string) {
        this.webSocketService.emit(TOGGLE_PAUSE_TIMER_EVENT, { pin });
    }

    onTogglePauseTimer(pin: string, callback: (isRunning: boolean) => void): Subscription {
        return this.webSocketService.on(TOGGLE_PAUSE_TIMER_EVENT, applyIfPinMatches(pin, callback));
    }

    accelerateTimer(pin: string, ticksPerSecond: number) {
        this.webSocketService.emit(ACCELERATE_TIMER_EVENT, { pin, ticksPerSecond });
    }

    onAccelerateTimer(pin: string, callback: () => void): Subscription {
        return this.webSocketService.on(ACCELERATE_TIMER_EVENT, applyIfPinMatches(pin, callback));
    }
}
