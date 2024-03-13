import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { PlayerState } from '@common/player-state';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

const START_GAME_COUNTDOWN_DURATION_SECONDS = 5;
const NEXT_QUESTION_DELAY_SECONDS = 3;
const CANCEL_GAME_NOTICE_DURATION_MS = 5000;

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    pin: string;
    gameState: GameState = GameState.Opened;
    isEnded: boolean = false;
    currentQuestionHasEnded: boolean = false;

    private eventSubscriptions: Subscription[] = [];

    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly timerService: TimerService;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly barChartService: BarChartService,
        private readonly snackBarService: MatSnackBar,
        gameServicesProvider: GameServicesProvider,
    ) {
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.timerService = gameServicesProvider.timerService;
    }

    get barCharts(): BarChartData[] {
        return this.barChartService.getAllBarChart();
    }

    get barChart(): BarChartData {
        return this.barChartService.getLatestBarChart();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (!sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    isLocked() {
        return this.gameState === GameState.Closed;
    }

    isRunning() {
        return this.gameState === GameState.Running;
    }

    toggleLock() {
        this.gameService.toggleGameLock(this.pin);
    }

    startGame() {
        this.gameState = GameState.Running;
        this.gameService.startGame(this.pin);
        this.timerService.startTimer(this.pin, TimerEventType.StartGame, START_GAME_COUNTDOWN_DURATION_SECONDS);
    }

    nextQuestion() {
        this.gameState = GameState.Running;
        this.currentQuestionHasEnded = false;
        this.gameService.nextQuestion(this.pin);
        this.timerService.startTimer(this.pin, TimerEventType.NextQuestion, NEXT_QUESTION_DELAY_SECONDS);
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

            this.gameService.onToggleSelectChoice(pin, (submissions) => {
                this.barChartService.updateBarChartData(submissions);
            }),

            this.gameService.onToggleGameLock(pin, (gameState) => {
                this.gameState = gameState;
            }),

            this.gameService.onSubmitChoices(pin, (evaluation) => {
                if (evaluation.isLast) {
                    this.currentQuestionHasEnded = true;
                }
            }),

            this.gameService.onStartGame(pin, (question) => {
                this.barChartService.addQuestion(question);
            }),

            this.gameService.onNextQuestion(pin, (question) => {
                this.barChartService.addQuestion(question);
            }),

            this.gameService.onPlayerAbandon(pin, () => {
                this.gameHttpService.getGameSnapshotByPin(pin).subscribe((snapshot) => {
                    if (this.isRunning() && snapshot.players.filter((x) => x.state === PlayerState.Playing).length === 0) {
                        this.gameService.cancelGame(pin);
                    }
                });
            }),

            this.timerService.onTimerTick(pin, (payload) => {
                if (!payload.remainingTime) {
                    if (payload.eventType === TimerEventType.StartGame) {
                        this.timerService.startTimer(pin, TimerEventType.Question);
                    } else if (payload.eventType === TimerEventType.NextQuestion) {
                        this.timerService.startTimer(pin, TimerEventType.Question);
                    }
                }
            }),
        );
    }
}
