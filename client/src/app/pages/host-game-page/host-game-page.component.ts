import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { Question } from '@app/interfaces/question';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { Subscription } from 'rxjs';

const THREE_SECOND_IN_MS = 3000;

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    pin: string;
    isEnded: boolean = false;
    gameState: GameState = GameState.Opened;
    question: Question;
    nextAvailable: boolean = false;
    // nextEndGame: boolean = false;
    getCurrentQuestionSubscription: Subscription;

    private barChartService: BarChartService = new BarChartService();

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

    get barChart(): BarChartData {
        return this.barChartService.getLatestBarChart();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.gameService.onNextQuestion(this.pin, this.barChartService.addQuestion);
        this.gameService.onToggleGameLock(this.pin, (gameState: GameState) => (this.gameState = gameState));
        // this.gameService.onToggleSelectChoice(this.pin, (payload: Submission) => {
        //     this.barChartService.updateBarChartData(payload);
        // });
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
                    this.router.navigateByUrl('/results-page');
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
}
