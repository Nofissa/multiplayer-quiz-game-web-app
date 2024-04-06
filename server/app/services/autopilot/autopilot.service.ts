import { GameGateway } from '@app/gateways/game.gateway';
import { TimerGateway } from '@app/gateways/timer.gateway';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Socket } from 'socket.io';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

const QUESTION_END_DELAY_MS = 3000;
const NEXT_QUESTION_DELAY_SEC = 3;
const START_GAME_DELAY_SEC = 5;

@Injectable()
export class AutopilotService {
    timeoutSubscriptions: Map<string, Subscription> = new Map();
    lastQcmSubmissionSubscriptions: Map<string, Subscription> = new Map();

    constructor(private readonly moduleRef: ModuleRef) {}

    private get gameService(): GameService {
        return this.moduleRef.get(GameService);
    }

    private get gameGateway(): GameGateway {
        return this.moduleRef.get(GameGateway);
    }

    private get timerService(): TimerService {
        return this.moduleRef.get(TimerService);
    }

    private get timerGateway(): TimerGateway {
        return this.moduleRef.get(TimerGateway);
    }

    runGame(client: Socket, pin: string) {
        this.timeoutSubscriptions.set(
            pin,
            this.timerService.onTimeout(pin, (eventType: TimerEventType) => {
                if (eventType === TimerEventType.StartGame || eventType === TimerEventType.NextQuestion) {
                    this.timerGateway.startTimer(client, { pin, eventType: TimerEventType.Question });
                }
            }),
        );

        this.lastQcmSubmissionSubscriptions.set(
            pin,
            this.gameService.onLastQcmSubmission(pin, () => {
                this.timerGateway.stopTimer(client, { pin });

                setTimeout(() => {
                    const game = this.gameService.getGame(pin);

                    if (game.currentQuestionIndex < game.quiz.questions.length - 1) {
                        this.gameGateway.nextQuestion(client, { pin });
                        this.timerGateway.startTimer(client, { pin, eventType: TimerEventType.NextQuestion, duration: NEXT_QUESTION_DELAY_SEC });
                    } else {
                        this.gameGateway.endGame(client, { pin });
                        this.stop(pin);
                    }
                }, QUESTION_END_DELAY_MS);
            }),
        );

        this.timerGateway.startTimer(client, { pin, eventType: TimerEventType.StartGame, duration: START_GAME_DELAY_SEC });
    }

    private stop(pin: string) {
        this.timeoutSubscriptions.get(pin)?.unsubscribe();
        this.timeoutSubscriptions.delete(pin);
        this.lastQcmSubmissionSubscriptions.get(pin)?.unsubscribe();
        this.lastQcmSubmissionSubscriptions.delete(pin);
    }
}
