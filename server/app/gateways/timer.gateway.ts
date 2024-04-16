import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { AccelerateTimerPayload } from '@common/accelerate-timer-payload';
import { GameEventPayload } from '@common/game-event-payload';
import { PinPayload } from '@common/pin-payload';
import { StartTimerPayload } from '@common/start-timer-payload';
import { TimerEvent } from '@common/timer-event-enum';
import { TimerPayload } from '@common/timer-payload';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:4200', 'https://polytechnique-montr-al.gitlab.io', 'http://polytechnique-montr-al.gitlab.io'],
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
        credentials: false,
    },
})
export class TimerGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly timerService: TimerService,
        private readonly gameService: GameService,
    ) {}

    @SubscribeMessage(TimerEvent.START_TIMER_EVENT)
    startTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin, eventType, duration }: StartTimerPayload) {
        try {
            duration = duration ?? this.gameService.getGame(pin).quiz.duration;
            const startRemainingTime = this.timerService.startTimer(client, pin, duration, eventType, (remainingTime) => {
                const timerTickPayload: GameEventPayload<TimerPayload> = { pin, data: { remainingTime, eventType } };
                this.server.to(pin).emit(TimerEvent.TIMER_TICK_EVENT, timerTickPayload);
            });
            const startTimerPayload: GameEventPayload<TimerPayload> = { pin, data: { remainingTime: startRemainingTime, eventType } };

            this.server.to(pin).emit(TimerEvent.START_TIMER_EVENT, startTimerPayload);
        } catch (error) {
            client.emit(TimerEvent.ERROR_EVENT, error.message);
        }
    }

    @SubscribeMessage(TimerEvent.STOP_TIMER_EVENT)
    stopTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            this.timerService.stopTimer(client, pin);
            const payload: GameEventPayload<null> = { pin, data: null };

            this.server.to(pin).emit(TimerEvent.STOP_TIMER_EVENT, payload);
        } catch (error) {
            client.emit(TimerEvent.ERROR_EVENT, error.message);
        }
    }

    @SubscribeMessage(TimerEvent.TOGGLE_PAUSE_TIMER_EVENT)
    togglePauseTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const isRunning = this.timerService.togglePauseTimer(client, pin);
            const payload: GameEventPayload<boolean> = { pin, data: isRunning };

            this.server.to(pin).emit(TimerEvent.TOGGLE_PAUSE_TIMER_EVENT, payload);
        } catch (error) {
            client.emit(TimerEvent.ERROR_EVENT, error.message);
        }
    }

    @SubscribeMessage(TimerEvent.ACCELERATE_TIMER_EVENT)
    accelerateTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin, ticksPerSecond }: AccelerateTimerPayload) {
        try {
            this.timerService.accelerateTimer(client, pin, ticksPerSecond);
            const payload: GameEventPayload<null> = { pin, data: null };

            this.server.to(pin).emit(TimerEvent.ACCELERATE_TIMER_EVENT, payload);
        } catch (error) {
            client.emit(TimerEvent.ERROR_EVENT, error.message);
        }
    }
}
