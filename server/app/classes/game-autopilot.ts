import { GameGateway } from '@app/gateways/game.gateway';
import { TimerGateway } from '@app/gateways/timer.gateway';
import { ModuleRef } from '@nestjs/core';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Socket } from 'socket.io';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

const QUESTION_END_DELAY_MS = 3000;
const NEXT_QUESTION_DELAY_SEC = 3;
const START_GAME_DELAY_SEC = 5;

export class GameAutopilot {
    private timeoutSubscription: Subscription;
    private lastQcmSubmissionSubscription: Subscription;
    private questionEndTimeout: NodeJS.Timeout;

    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly client: Socket,
        private readonly pin: string,
    ) {}

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

    run() {
        this.timeoutSubscription = this.timerService.onTimeout(this.pin, (eventType: TimerEventType) => {
            if (eventType === TimerEventType.StartGame || eventType === TimerEventType.NextQuestion) {
                this.timerGateway.startTimer(this.client, { pin: this.pin, eventType: TimerEventType.Question });
            }
        });

        this.lastQcmSubmissionSubscription = this.gameService.onLastQcmSubmission(this.pin, () => {
            this.timerGateway.stopTimer(this.client, { pin: this.pin });

            this.questionEndTimeout = setTimeout(() => {
                const game = this.gameService.getGame(this.pin);

                if (game.currentQuestionIndex < game.quiz.questions.length - 1) {
                    this.gameGateway.nextQuestion(this.client, { pin: this.pin });
                    this.timerGateway.startTimer(this.client, {
                        pin: this.pin,
                        eventType: TimerEventType.NextQuestion,
                        duration: NEXT_QUESTION_DELAY_SEC,
                    });
                } else {
                    this.gameGateway.endGame(this.client, { pin: this.pin });
                    this.stop();
                }
            }, QUESTION_END_DELAY_MS);
        });

        this.timerGateway.startTimer(this.client, { pin: this.pin, eventType: TimerEventType.StartGame, duration: START_GAME_DELAY_SEC });
    }

    stop() {
        clearTimeout(this.questionEndTimeout);
        if (this.timeoutSubscription && !this.timeoutSubscription.closed) {
            this.timeoutSubscription.unsubscribe();
        }
        if (this.lastQcmSubmissionSubscription && !this.lastQcmSubmissionSubscription.closed) {
            this.lastQcmSubmissionSubscription.unsubscribe();
        }
    }
}
