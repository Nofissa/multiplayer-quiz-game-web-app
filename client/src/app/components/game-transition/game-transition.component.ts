import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GameTransitionDisplayOptions } from '@app/interfaces/game-transition-display-options';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameSnapshot } from '@common/game-snapshot';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-transition',
    templateUrl: './game-transition.component.html',
    styleUrls: ['./game-transition.component.scss'],
})
export class GameTransitionComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    @Input()
    displayOptions: GameTransitionDisplayOptions;

    snapshot: GameSnapshot;
    isQuestion: boolean = false;
    isStartingGame: boolean = false;
    isLoadingNextQuestion: boolean = false;

    private eventSubscriptions: Subscription[] = [];

    private readonly gameHttpService: GameHttpService;
    private readonly timerService: TimerService;

    constructor(gameServicesProvider: GameServicesProvider) {
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.timerService = gameServicesProvider.timerService;
    }

    ngOnInit() {
        this.setupSubscription(this.pin);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (!sub.closed) {
                sub.unsubscribe();
                this.eventSubscriptions = this.eventSubscriptions.filter((item) => item !== sub);
            }
        });
    }

    private setupSubscription(pin: string) {
        this.eventSubscriptions.push(
            this.timerService.onStartTimer(pin, (payload) => {
                this.gameHttpService.getGameSnapshotByPin(pin).subscribe((snapshot) => {
                    this.snapshot = snapshot;
                });

                switch (payload.eventType) {
                    case TimerEventType.StartGame:
                        this.isStartingGame = true;
                        break;
                    case TimerEventType.NextQuestion:
                        this.isLoadingNextQuestion = true;
                        break;
                    case TimerEventType.Question:
                        this.isQuestion = true;
                        break;
                    default:
                        break;
                }
            }),

            this.timerService.onTimerTick(pin, (payload) => {
                if (!payload.remainingTime) {
                    switch (payload.eventType) {
                        case TimerEventType.StartGame:
                            this.isStartingGame = false;
                            break;
                        case TimerEventType.NextQuestion:
                            this.isLoadingNextQuestion = false;
                            break;
                        case TimerEventType.Question:
                            this.isQuestion = false;
                            break;
                        default:
                            break;
                    }
                }
            }),
        );
    }
}
