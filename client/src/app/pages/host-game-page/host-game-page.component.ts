import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { Subscription } from 'rxjs';

const START_GAME_COUNTDOWN_DURATION = 5;

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    pin: string;
    isEnded: boolean = false;
    private gameState: GameState = GameState.Opened;

    private toggleSelectChoiceSubscription: Subscription = new Subscription();
    private toggleGameLockSubscription: Subscription = new Subscription();
    private startGameSubscription: Subscription = new Subscription();
    private nextQuestionSubscription: Subscription = new Subscription();

    private readonly gameService: GameService;
    private readonly timerService: TimerService;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly barChartService: BarChartService,
        gameServicesProvider: GameServicesProvider,
    ) {
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
        if (!this.toggleSelectChoiceSubscription.closed) {
            this.toggleSelectChoiceSubscription.unsubscribe();
        }
        if (!this.toggleGameLockSubscription.closed) {
            this.toggleGameLockSubscription.unsubscribe();
        }
        if (!this.startGameSubscription.closed) {
            this.startGameSubscription.unsubscribe();
        }
        if (!this.nextQuestionSubscription.closed) {
            this.nextQuestionSubscription.unsubscribe();
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
        this.gameService.startGame(this.pin);
    }

    nextQuestion() {
        this.gameService.nextQuestion(this.pin);
    }

    private setupSubscriptions(pin: string) {
        this.toggleSelectChoiceSubscription = this.gameService.onToggleSelectChoice(pin, (submissions) => {
            this.barChartService.updateBarChartData(submissions);
        });
        this.toggleGameLockSubscription = this.gameService.onToggleGameLock(pin, (gameState) => {
            this.gameState = gameState;
        });
        this.startGameSubscription = this.gameService.onStartGame(pin, (question) => {
            this.barChartService.addQuestion(question);
            this.timerService.startTimer(this.pin, START_GAME_COUNTDOWN_DURATION);
        });
        this.nextQuestionSubscription = this.gameService.onNextQuestion(pin, (question) => {
            this.barChartService.addQuestion(question);
        });
    }
}
