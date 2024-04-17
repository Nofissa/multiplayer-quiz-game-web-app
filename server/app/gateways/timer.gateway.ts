import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { AccelerateTimerPayload } from '@common/accelerate-timer-payload';
import { GameEventPayload } from '@common/game-event-payload';
import { PinPayload } from '@common/pin-payload';
import { StartTimerPayload } from '@common/start-timer-payload';
import { TimerEvent } from '@common/timer-event';
import { TimerPayload } from '@common/timer-payload';
import { GeneralWebSocketEvent } from '@common/general-websocket-event';
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

    @SubscribeMessage(TimerEvent.StartTimer)
    startTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin, eventType, duration }: StartTimerPayload) {
        try {
            duration = duration ?? this.gameService.getGame(pin).quiz.duration;
            const startRemainingTime = this.timerService.startTimer(client, pin, duration, eventType, (remainingTime) => {
                const timerTickPayload: GameEventPayload<TimerPayload> = { pin, data: { remainingTime, eventType } };
                this.server.to(pin).emit(TimerEvent.TimerTick, timerTickPayload);
            });
            const startTimerPayload: GameEventPayload<TimerPayload> = { pin, data: { remainingTime: startRemainingTime, eventType } };

            this.server.to(pin).emit(TimerEvent.StartTimer, startTimerPayload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(TimerEvent.StopTimer)
    stopTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            this.timerService.stopTimer(client, pin);
            const payload: GameEventPayload<null> = { pin, data: null };

            this.server.to(pin).emit(TimerEvent.StopTimer, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(TimerEvent.TogglePauseTimer)
    togglePauseTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin }: PinPayload) {
        try {
            const isRunning = this.timerService.togglePauseTimer(client, pin);
            const payload: GameEventPayload<boolean> = { pin, data: isRunning };

            this.server.to(pin).emit(TimerEvent.TogglePauseTimer, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }

    @SubscribeMessage(TimerEvent.AccelerateTimer)
    accelerateTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin, ticksPerSecond }: AccelerateTimerPayload) {
        try {
            this.timerService.accelerateTimer(client, pin, ticksPerSecond);
            const payload: GameEventPayload<null> = { pin, data: null };

            this.server.to(pin).emit(TimerEvent.AccelerateTimer, payload);
        } catch (error) {
            client.emit(GeneralWebSocketEvent.Error, error.message);
        }
    }
}
