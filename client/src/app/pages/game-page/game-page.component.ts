import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

const START_GAME_COUNTDOWN_DURATION_SECONDS = 5;
const NEXT_QUESTION_DELAY_SECONDS = 3;
const CANCEL_GAME_NOTICE_DURATION_MS = 5000;

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    pin: string;
    isTest: boolean;

    isStarting: boolean = false;
    isLoadingNextQuestion: boolean = false;
    hasStarted: boolean = false;
    currentQuestionHasEnded: boolean = false;
    isLastQuestion: boolean = false;

    private eventSubscriptions: Subscription[] = [];

    private readonly activatedRoute: ActivatedRoute;
    private readonly router: Router;
    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly timerService: TimerService;

    constructor(
        private readonly snackBarService: MatSnackBar,
        gameServicesProvider: GameServicesProvider,
        routingDependenciesProvider: RoutingDependenciesProvider,
    ) {
        this.activatedRoute = routingDependenciesProvider.activatedRoute;
        this.router = routingDependenciesProvider.router;
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.timerService = gameServicesProvider.timerService;
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.isTest = this.activatedRoute.snapshot.queryParams['isTest'] === 'true';

        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe({
            error: (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.router.navigateByUrl('/home');
                }
            },
        });

        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (!sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    startGame() {
        this.gameService.startGame(this.pin);
    }

    nextQuestion() {
        this.gameService.nextQuestion(this.pin);
    }

    endGame() {
        this.gameService.endGame(this.pin);
    }

    handleCancelGame() {
        this.router.navigate(['home'], { queryParams: { pin: this.pin } });
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
                    this.hasStarted = true;
                    this.isStarting = true;
                } else if (payload.eventType === TimerEventType.NextQuestion) {
                    this.currentQuestionHasEnded = false;
                    this.isLoadingNextQuestion = true;
                }
            }),

            this.gameService.onStartGame(pin, (payload) => {
                if (!this.isTest) {
                    return;
                }

                if (payload.isLast) {
                    this.isLastQuestion = true;
                }

                this.timerService.startTimer(this.pin, TimerEventType.StartGame, START_GAME_COUNTDOWN_DURATION_SECONDS);
            }),

            this.gameService.onNextQuestion(pin, (payload) => {
                if (!this.isTest) {
                    return;
                }

                if (payload.isLast) {
                    this.isLastQuestion = true;
                }

                this.timerService.startTimer(this.pin, TimerEventType.NextQuestion, NEXT_QUESTION_DELAY_SECONDS);
            }),

            this.gameService.onSubmitChoices(pin, (evaluation) => {
                if (this.isTest && evaluation.isLast) {
                    this.currentQuestionHasEnded = true;
                    this.timerService.stopTimer(pin);
                }
            }),

            this.timerService.onTimerTick(pin, (payload) => {
                if (!payload.remainingTime) {
                    if (payload.eventType === TimerEventType.StartGame) {
                        this.isStarting = false;
                        if (this.isTest) {
                            this.timerService.startTimer(pin, TimerEventType.Question);
                        }
                    } else if (payload.eventType === TimerEventType.NextQuestion) {
                        this.isLoadingNextQuestion = false;
                        if (this.isTest) {
                            this.timerService.startTimer(pin, TimerEventType.Question);
                        }
                    }
                }
            }),
            this.gameService.onCancelGame(pin, () => {
                this.handleCancelGame();
            }),
        );
    }
}
