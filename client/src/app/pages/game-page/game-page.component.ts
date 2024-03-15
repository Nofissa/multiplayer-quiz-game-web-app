import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

const CANCEL_GAME_NOTICE_DURATION_MS = 5000;

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    pin: string;
    isTest: boolean;

    isStarting: boolean;
    isLoadingNextQuestion: boolean;

    private gameState: GameState;
    private eventSubscriptions: Subscription[] = [];

    private readonly activatedRoute: ActivatedRoute;
    private readonly router: Router;
    private readonly gameService: GameService;
    private readonly timerService: TimerService;

    constructor(
        private readonly snackBarService: MatSnackBar,
        gameServicesProvider: GameServicesProvider,
        routingDependenciesProvider: RoutingDependenciesProvider,
    ) {
        this.gameService = gameServicesProvider.gameService;
        this.timerService = gameServicesProvider.timerService;
        this.activatedRoute = routingDependenciesProvider.activatedRoute;
        this.router = routingDependenciesProvider.router;
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.isTest = this.activatedRoute.snapshot.queryParams['isTest'] === 'true';

        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (!sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    isPaused(): boolean {
        return this.gameState === GameState.Paused;
    }

    private setupSubscriptions(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onCancelGame(pin, (message) => {
                this.snackBarService.open(message, '', {
                    duration: CANCEL_GAME_NOTICE_DURATION_MS,
                    verticalPosition: 'top',
                    panelClass: ['base-snackbar'],
                });

                this.router.navigateByUrl('/home');
            }),

            this.gameService.onEndGame(pin, () => {
                this.router.navigate(['results'], { queryParams: { pin: this.pin } });
            }),

            this.timerService.onStartTimer(pin, (payload) => {
                if (payload.eventType === TimerEventType.StartGame) {
                    this.isStarting = true;
                } else if (payload.eventType === TimerEventType.NextQuestion) {
                    this.isLoadingNextQuestion = true;
                }
            }),

            this.timerService.onTimerTick(pin, (payload) => {
                if (!payload.remainingTime) {
                    if (payload.eventType === TimerEventType.StartGame) {
                        this.isStarting = false;
                    } else if (payload.eventType === TimerEventType.NextQuestion) {
                        this.isLoadingNextQuestion = false;
                    }
                }
            }),
        );
    }
}
