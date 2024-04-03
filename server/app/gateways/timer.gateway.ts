import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameEventPayload } from '@common/game-event-payload';
import { TimerEventType } from '@common/timer-event-type';
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

    @SubscribeMessage('startTimer')
    startTimer(
        @ConnectedSocket() client: Socket,
        @MessageBody() { pin, eventType, duration }: { pin: string; eventType: TimerEventType; duration?: number },
    ) {
        try {
            duration = duration ?? this.gameService.getGame(pin).quiz.duration;
            const startRemainingTime = this.timerService.startTimer(client, pin, duration, (remainingTime) => {
                const timerTickPayload: GameEventPayload<TimerPayload> = { pin, data: { remainingTime, eventType } };
                this.server.to(pin).emit('timerTick', timerTickPayload);
            });
            const startTimerPayload: GameEventPayload<TimerPayload> = { pin, data: { remainingTime: startRemainingTime, eventType } };

            this.server.to(pin).emit('startTimer', startTimerPayload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('stopTimer')
    stopTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            this.timerService.stopTimer(client, pin);
            const payload: GameEventPayload<null> = { pin, data: null };

            this.server.to(pin).emit('stopTimer', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('togglePauseTimer')
    togglePauseTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin }: { pin: string }) {
        try {
            const isRunning = this.timerService.togglePauseTimer(client, pin);
            const payload: GameEventPayload<boolean> = { pin, data: isRunning };

            this.server.to(pin).emit('togglePauseTimer', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }

    @SubscribeMessage('accelerateTimer')
    accelerateTimer(@ConnectedSocket() client: Socket, @MessageBody() { pin, ticksPerSecond }: { pin: string; ticksPerSecond: number }) {
        try {
            this.timerService.accelerateTimer(client, pin, ticksPerSecond);
            const payload: GameEventPayload<null> = { pin, data: null };

            this.server.to(pin).emit('accelerateTimer', payload);
        } catch (error) {
            client.emit('error', error.message);
        }
    }
}
