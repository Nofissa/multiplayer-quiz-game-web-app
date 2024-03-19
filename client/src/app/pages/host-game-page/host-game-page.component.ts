import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { PlayerState } from '@common/player-state';
import { Question } from '@common/question';
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
export class HostGamePageComponent implements OnInit {
    pin: string;
    gameState: GameState = GameState.Opened;
    currentQuestionHasEnded: boolean = false;
    isLastQuestion: boolean = false;
    question: Question | undefined;
    nextAvailable: boolean = false;
    private eventSubscriptions: Subscription[] = [];
    private readonly activatedRoute: ActivatedRoute;
    private readonly router: Router;
    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly timerService: TimerService;

    // Disabled because this page is rich in interaction an depends on many services as a consequence
    // eslint-disable-next-line max-params
    constructor(
        private readonly barChartService: BarChartService,
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

    get barCharts(): BarChartData[] {
        return this.barChartService.getAllBarChart();
    }

    get barChart(): BarChartData | undefined {
        return this.barChartService.getCurrentQuestionData();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe({
            error: (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.router.navigate(['home']);
                }
            },
        });

        this.setupSubscriptions(this.pin);
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

    nextQuestion() {
        this.gameState = GameState.Running;
        this.currentQuestionHasEnded = false;
        this.gameService.nextQuestion(this.pin);
    }

    cancelGame() {
        this.gameService.cancelGame(this.pin);
    }

    endGame() {
        this.gameService.endGame(this.pin);
    }

    private handleEndGame() {
        this.router.navigate(['results'], { queryParams: { pin: this.pin } });
    }

    private setupSubscriptions(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onCancelGame(pin, (message) => {
                this.snackBarService.open(message, '', {
                    duration: CANCEL_GAME_NOTICE_DURATION_MS,
                    verticalPosition: 'top',
                    panelClass: ['base-snackbar'],
                });

                this.router.navigate(['home']);
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
                    this.timerService.stopTimer(pin);
                }
            }),

            this.gameService.onStartGame(pin, (data) => {
                this.isLastQuestion = data.isLast;
                this.gameState = GameState.Running;
                this.barChartService.addQuestion(data.question);
                this.timerService.startTimer(this.pin, TimerEventType.StartGame, START_GAME_COUNTDOWN_DURATION_SECONDS);
            }),

            this.gameService.onNextQuestion(pin, (data) => {
                this.isLastQuestion = data.isLast;
                this.barChartService.addQuestion(data.question);
                this.timerService.startTimer(this.pin, TimerEventType.NextQuestion, NEXT_QUESTION_DELAY_SECONDS);
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
                    if (payload.eventType === TimerEventType.StartGame || payload.eventType === TimerEventType.NextQuestion) {
                        this.timerService.startTimer(pin, TimerEventType.Question);
                    }
                }
            }),

            this.gameService.onEndGame(pin, () => {
                this.handleEndGame();
            }),
        );
    }
}
