import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NEXT_QUESTION_DELAY_SECONDS, NOTICE_DURATION_MS, PANIC_AUDIO_NAME, START_GAME_COUNTDOWN_DURATION_SECONDS } from '@app/constants/constants';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { SoundService } from '@app/services/sound/sound.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { QuestionPayload } from '@common/question-payload';
import { TimerEventType } from '@common/timer-event-type';
import { v4 as uuidv4 } from 'uuid';
import { environment } from 'src/environments/environment';

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

    private readonly uuid = uuidv4();
    private readonly activatedRoute: ActivatedRoute;
    private readonly router: Router;
    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly timerService: TimerService;
    private readonly soundService: SoundService;

    // This page simply depends on a lot of services
    // eslint-disable-next-line max-params
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly snackBarService: MatSnackBar,
        gameServicesProvider: GameServicesProvider,
        routingDependenciesProvider: RoutingDependenciesProvider,
    ) {
        this.activatedRoute = routingDependenciesProvider.activatedRoute;
        this.router = routingDependenciesProvider.router;
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.timerService = gameServicesProvider.timerService;
        this.soundService = gameServicesProvider.soundService;
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.isTest = this.activatedRoute.snapshot.queryParams['isTest'] === 'true';

        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe({
            next: (snapshot) => {
                if (snapshot.state === GameState.Ended) {
                    this.router.navigateByUrl('home');
                }
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.router.navigateByUrl('/home');
                }
            },
        });

        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.subscriptionService.clear(this.uuid);
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

    handleQuestionPayload(payload: QuestionPayload, eventType: TimerEventType, delay: number) {
        if (!this.isTest) {
            return;
        }

        if (payload.isLast) {
            this.isLastQuestion = true;
        }

        this.timerService.startTimer(this.pin, eventType, delay);
    }

    private setupSubscriptions(pin: string) {
        this.setupGameSubscriptions(pin);
        this.setupTimerSubscriptions(pin);
    }

    private setupGameSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.gameService.onStartGame(pin, (payload) => {
                this.handleQuestionPayload(payload, TimerEventType.StartGame, START_GAME_COUNTDOWN_DURATION_SECONDS);
            }),
            this.gameService.onNextQuestion(pin, (payload) => {
                this.handleQuestionPayload(payload, TimerEventType.NextQuestion, NEXT_QUESTION_DELAY_SECONDS);
            }),
            this.gameService.onQcmSubmit(pin, (evaluation) => {
                if (evaluation.isLast) {
                    this.soundService.stopSound(PANIC_AUDIO_NAME);

                    if (this.isTest) {
                        this.currentQuestionHasEnded = true;
                        this.timerService.stopTimer(pin);
                    }
                }
            }),
            this.gameService.onQrlSubmit(pin, (submission) => {
                if (submission.isLast) {
                    this.soundService.stopSound(PANIC_AUDIO_NAME);

                    if (this.isTest) {
                        this.currentQuestionHasEnded = true;
                        this.timerService.stopTimer(pin);
                    }
                }
            }),
            this.gameService.onCancelGame(pin, (message) => {
                this.snackBarService.open(message, '', {
                    duration: NOTICE_DURATION_MS,
                    verticalPosition: 'top',
                    panelClass: ['base-snackbar'],
                });

                this.router.navigateByUrl('/home');
            }),
            this.gameService.onEndGame(pin, () => {
                this.handleEndGame();
            }),
        );
    }

    private setupTimerSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.timerService.onStartTimer(pin, (payload) => {
                if (payload.eventType === TimerEventType.StartGame) {
                    this.hasStarted = true;
                    this.isStarting = true;
                } else if (payload.eventType === TimerEventType.NextQuestion) {
                    this.currentQuestionHasEnded = false;
                    this.isLoadingNextQuestion = true;
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
            this.timerService.onAccelerateTimer(pin, () => {
                this.soundService.loadSound(PANIC_AUDIO_NAME, environment.panicAudioSrc);
                this.soundService.playSound(PANIC_AUDIO_NAME);
            }),
            this.timerService.onTogglePauseTimer(pin, (isRunning) => {
                if (isRunning) {
                    this.soundService.playSound(PANIC_AUDIO_NAME);
                } else {
                    this.soundService.stopSound(PANIC_AUDIO_NAME);
                }
            }),
        );
    }

    private handleEndGame() {
        this.router.navigate(['results'], { queryParams: { pin: this.pin } });
    }
}
