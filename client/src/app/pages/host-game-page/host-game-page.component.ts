import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { Question } from '@app/interfaces/question';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { Submission } from '@common/submission';
import { Subscription } from 'rxjs';

const THREE_SECOND_IN_MS = 3000;

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    pin: string;
    gameState: GameState = GameState.Opened;
    question: Question | undefined;
    nextAvailable: boolean = false;
    // nextEndGame: boolean = false; to use later when we have a way to know if it's the last question
    getCurrentQuestionSubscription: Subscription;

    private barChartService: BarChartService;

    // necessary services for this component to work
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameService: GameService,
        private readonly timerService: TimerService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
    ) {}

    get barCharts(): BarChartData[] {
        return this.barChartService.getAllBarChart();
    }

    get barChart(): BarChartData | undefined {
        return this.barChartService.getCurrentQuestionData();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.barChartService = new BarChartService();
        this.gameService.onToggleSelectChoice(this.pin, (data: { clientId: string; submission: Submission }) => {
            this.barChartService.updateBarChartData(data);
            return;
        });
        this.gameService.onNextQuestion(this.pin, (question: Question) => {
            this.barChartService.addQuestion(question);
        });
        this.gameService.onToggleGameLock(this.pin, (gameState: GameState) => (this.gameState = gameState));

        this.gameService.onEndGame((gameState: GameState) => {
            this.handleEndGame(gameState);
        });
        this.gameService.onNextQuestion(this.pin, this.barChartService.addQuestion);
        this.gameService.onToggleGameLock(this.pin, (gameState: GameState) => (this.gameState = gameState));

        this.gameService.getCurrentQuestion(this.pin);
        this.getCurrentQuestionSubscription = this.gameService.onGetCurrentQuestion(this.pin, (question: Question) => {
            this.question = question;
        });
    }

    ngOnDestroy(): void {
        if (this.getCurrentQuestionSubscription) {
            this.getCurrentQuestionSubscription.unsubscribe();
        }
    }

    isLocked() {
        return this.gameState === GameState.Closed;
    }

    isStarted() {
        return this.gameState === GameState.Started;
    }

    isEnded() {
        return this.gameState === GameState.Ended;
    }

    toggleLock() {
        this.gameService.toggleGameLock(this.pin);
    }

    startGame() {
        this.gameState = GameState.Started;
        this.timerService.startTimer(this.pin);
    }

    nextQuestion() {
        setTimeout(() => {
            this.gameService.nextQuestion(this.pin);
            this.gameService.onNextQuestion(this.pin, (question: Question) => {
                this.question = question;
                if (!this.question) {
                    this.endGame();
                }
            });
            if (this.question) {
                this.timerService.startTimer(this.pin);
            }
        }, THREE_SECOND_IN_MS);
        this.nextAvailable = false;
    }

    onTimerExpired() {
        this.nextAvailable = true;
    }

    endGame() {
        this.gameService.endGame(this.pin);
    }

    handleEndGame(gameState: GameState) {
        this.gameState = gameState;
        this.router.navigate(['results-page'], { queryParams: { pin: this.pin } });
    }
}
