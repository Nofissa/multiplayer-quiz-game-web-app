import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BarChartSwiperComponent } from '@app/components/bar-chart-swiper/bar-chart-swiper.component';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import {
    NEXT_QUESTION_DELAY_SECONDS,
    NOTICE_DURATION_MS,
    PANIC_AUDIO_NAME,
    START_GAME_COUNTDOWN_DURATION_SECONDS,
    SWIPER_SYNC_DELAY_MS,
} from '@app/constants/constants';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { SoundService } from '@app/services/sound/sound.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { TimerService } from '@app/services/timer/timer.service';
import { BarchartSubmission } from '@common/barchart-submission';
import { BarChartType } from '@common/barchart-type';
import { GameState } from '@common/game-state';
import { PlayerState } from '@common/player-state';
import { Question } from '@common/question';
import { QuestionType } from '@common/question-type';
import { TimerEventType } from '@common/timer-event-type';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    @ViewChild(BarChartSwiperComponent) barChartSwiperComponent: BarChartSwiperComponent;
    pin: string;
    currentQuestionHasEnded: boolean = false;
    isLastQuestion: boolean = false;
    private isRandom: boolean;
    private gameState: GameState = GameState.Opened;

    private readonly uuid: string = uuidv4();
    private questionType: QuestionType;
    private readonly activatedRoute: ActivatedRoute;
    private readonly router: Router;
    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly timerService: TimerService;
    private readonly playerService: PlayerService;
    private readonly soundService: SoundService;
    private readonly snackBarService: MatSnackBar;
    private readonly dialogService: MatDialog;

    // Disabled because this page is rich in interaction an depends on many services as a consequence
    // eslint-disable-next-line max-params
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly barChartService: BarChartService,
        materialServicesProvider: MaterialServicesProvider,
        gameServicesProvider: GameServicesProvider,
        routingDependenciesProvider: RoutingDependenciesProvider,
    ) {
        this.activatedRoute = routingDependenciesProvider.activatedRoute;
        this.router = routingDependenciesProvider.router;
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.timerService = gameServicesProvider.timerService;
        this.playerService = gameServicesProvider.playerService;
        this.soundService = gameServicesProvider.soundService;
        this.snackBarService = materialServicesProvider.snackBar;
        this.dialogService = materialServicesProvider.dialog;
    }

    get barCharts(): BarChartData[] {
        return this.barChartService.getAllBarChart();
    }

    get barChart(): BarChartData | undefined {
        return this.barChartService.getCurrentQuestionData();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.isRandom = this.activatedRoute.snapshot.queryParams['isRandom'] === 'true';
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe({
            next: (snapshot) => {
                if (snapshot.state === GameState.Ended) {
                    this.router.navigate(['home']);
                }
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.router.navigate(['home']);
                }
            },
        });
        this.barChartService.flushData();
        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.subscriptionService.clear(this.uuid);
    }

    isLocked() {
        return this.gameState !== GameState.Opened;
    }

    isRunning() {
        return this.gameState === GameState.Running;
    }

    isEnded() {
        return this.gameState === GameState.Ended;
    }

    toggleLock() {
        this.gameService.toggleGameLock(this.pin);
    }

    startGame() {
        this.gameService.startGame(this.pin);
    }

    isQRL() {
        return this.questionType === QuestionType.QRL;
    }

    leaveGame() {
        const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
            width: '300px',
            data: { prompt: 'Voulez-vous vraiment quitter la partie?' },
        });

        dialogRef.afterClosed().subscribe((hasConfirmed: boolean) => {
            if (hasConfirmed) {
                this.gameService.cancelGame(this.pin);
                this.router.navigateByUrl('/');
            }
        });
    }

    nextQuestion() {
        this.gameState = GameState.Running;
        this.currentQuestionHasEnded = false;
        this.gameService.nextQuestion(this.pin);
        setTimeout(() => {
            if (this.barChartSwiperComponent && this.barChartSwiperComponent.swiperComponent) {
                this.barChartSwiperComponent.goToEndSlide();
            }
        }, SWIPER_SYNC_DELAY_MS);
    }

    endGame() {
        this.gameService.endGame(this.pin);
    }

    private addQuestion(question: Question) {
        this.questionType = question.type;
        if (question.type === QuestionType.QRL) {
            this.barChartService.addChart(question, BarChartType.ACTIVITY);
        } else {
            this.barChartService.addChart(question);
        }
    }

    private handleEndGame() {
        this.router.navigate(['results'], { queryParams: { pin: this.pin } });
    }

    private setupSubscriptions(pin: string) {
        this.setupGameSubscriptions(pin);
        this.setupTimerSubscriptions(pin);
        this.setupPlayerSubscriptions(pin);
    }

    private setupGameSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.gameService.onCancelGame(pin, (message) => {
                this.snackBarService.open(message, '', {
                    duration: NOTICE_DURATION_MS,
                    verticalPosition: 'top',
                    panelClass: ['base-snackbar'],
                });

                this.router.navigate(['home']);
            }),
            this.gameService.onQcmToggleChoice(pin, (submissions) => {
                this.barChartService.updateChartData(submissions);
            }),
            this.gameService.onToggleGameLock(pin, (gameState) => {
                this.gameState = gameState;
            }),
            this.gameService.onQcmSubmit(pin, (evaluation) => {
                if (evaluation.isLast) {
                    this.currentQuestionHasEnded = true;
                    this.timerService.stopTimer(pin);
                    this.soundService.stopSound(PANIC_AUDIO_NAME);
                }
            }),
            this.gameService.onQrlEvaluate(pin, (evaluation) => {
                if (evaluation.isLast) {
                    this.currentQuestionHasEnded = true;
                }
            }),
            this.gameService.onQrlSubmit(pin, (submission) => {
                if (submission.isLast) {
                    this.timerService.stopTimer(pin);
                }
            }),
            this.gameService.onStartGame(pin, (data) => {
                this.barChartService.flushData();
                this.isLastQuestion = data.isLast;
                this.gameState = GameState.Running;
                this.addQuestion(data.question);
                this.timerService.startTimer(this.pin, TimerEventType.StartGame, START_GAME_COUNTDOWN_DURATION_SECONDS);
                if (this.isRandom) {
                    this.router.navigate(['game'], { queryParams: { pin: this.pin } });
                }
                if (data.question.type === QuestionType.QRL) {
                    this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
                        for (const player of snapshot.players) {
                            this.barChartService.updateChartData({ clientId: player.socketId, index: 0, isSelected: true });
                            this.barChartService.updateChartData({ clientId: player.socketId, index: 1, isSelected: false });
                        }
                    });
                }
            }),
            this.gameService.onNextQuestion(pin, (data) => {
                this.isLastQuestion = data.isLast;
                this.addQuestion(data.question);
                if (data.question.type === QuestionType.QRL) {
                    this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
                        for (const player of snapshot.players) {
                            this.barChartService.updateChartData({ clientId: player.socketId, index: 0, isSelected: true });
                            this.barChartService.updateChartData({ clientId: player.socketId, index: 1, isSelected: false });
                        }
                    });
                }
                this.timerService.startTimer(this.pin, TimerEventType.NextQuestion, NEXT_QUESTION_DELAY_SECONDS);
            }),
            this.gameService.onEndGame(pin, () => {
                this.handleEndGame();
            }),
            this.gameService.onQrlInputChange(pin, (submission: BarchartSubmission) => {
                this.barChartService.updateChartData(submission);
            }),
        );
    }

    private setupTimerSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.timerService.onTimerTick(pin, (payload) => {
                if (payload.remainingTime === 0) {
                    if (payload.eventType === TimerEventType.StartGame || payload.eventType === TimerEventType.NextQuestion) {
                        this.timerService.startTimer(pin, TimerEventType.Question);
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

    private setupPlayerSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.playerService.onPlayerAbandon(pin, () => {
                this.gameHttpService.getGameSnapshotByPin(pin).subscribe((snapshot) => {
                    if (this.isRunning() && snapshot.players.filter((x) => x.state === PlayerState.Playing).length === 0) {
                        this.gameService.cancelGame(pin);
                    }
                });
            }),
        );
    }
}
