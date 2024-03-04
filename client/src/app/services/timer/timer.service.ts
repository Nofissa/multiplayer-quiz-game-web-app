import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { GameEventPayload } from '@common/game-event-payload';
import { Subscription } from 'rxjs';
import { applyIfPinMatches } from '@app/utils/condition-applications/conditional-applications';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(private readonly webSocketService: WebSocketService) {}

    startTimer(pin: string) {
        this.webSocketService.emit('startTimer', { pin });
    }

    onStartTimer(pin: string, callback: (startTime: number) => void): Subscription {
        return this.webSocketService.on('startTimer', (payload: GameEventPayload<number>) => {
            if (payload.pin === pin) {
                callback(payload.data);
            }
        });
    }

    onTimerTick(pin: string, callback: (remainingTime: number) => void): Subscription {
        return this.webSocketService.on('timerTick', applyIfPinMatches(pin, callback));
    }
}
