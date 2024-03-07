import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { questionStub } from '@app/TestStubs/question.stubs';
import { submissionStub } from '@app/TestStubs/submission.stubs';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { Question } from '@app/interfaces/question';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { GameState } from '@common/game-state';
import { Submission } from '@common/submission';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit {
    pin: string;
    isEnded: boolean = false;
    gameState: GameState = GameState.Opened;

    private barChartService: BarChartService;

    constructor(
        private readonly gameService: GameService,
        private readonly activatedRoute: ActivatedRoute,
    ) {}

    get barCharts(): BarChartData[] {
        return this.barChartService.getAllBarChart();
    }

    get barChart(): BarChartData {
        return this.barChartService.getLatestBarChart();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.barChartService = new BarChartService();
        this.gameService.onToggleSelectChoice((submission: Submission[]) => {
            this.barChartService.updateBarChartData(submission);
        });
        this.gameService.onNextQuestion((question: Question) => {
            this.barChartService.addQuestion(question);
        });
        this.gameService.onToggleGameLock((gameState: GameState) => (this.gameState = gameState));
        this.gameService.onStartGame((question: Question) => {
            this.handleStartGame(question);
        });
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
        // TODO
        console.log('game is started');
        this.gameService.startGame(this.pin);
    }

    nextQuestion() {
        // TODO
        return;
    }

    endGame() {
        this.gameService.sendPlayerResults(this.pin, [
            {
                question: questionStub()[0],
                submissions: submissionStub(),
            },
            {
                question: questionStub()[1],
                submissions: submissionStub(),
            },
        ]);
        return;
    }

    handleStartGame(question: Question) {
        console.log('i am called' + question);
        this.barChartService.addQuestion(question);
    }
}
