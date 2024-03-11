import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { GameState } from '@common/game-state';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit {
    pin: string;
    isEnded: boolean = false;
    gameState: GameState = GameState.Opened;

    private barChartService: BarChartService = new BarChartService();

    constructor(
        private readonly gameService: GameService,
        private readonly activatedRoute: ActivatedRoute,
    ) {
        this.gameService.onToggleSelectChoice(this.pin, this.barChartService.updateBarChartData);
        this.gameService.onNextQuestion(this.pin, this.barChartService.addQuestion);
        this.gameService.onToggleGameLock(this.pin, (gameState: GameState) => (this.gameState = gameState));
    }

    get barCharts(): BarChartData[] {
        return this.barChartService.getAllBarChart();
    }

    get barChart(): BarChartData {
        return this.barChartService.getLatestBarChart();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
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
        return;
    }

    nextQuestion() {
        // TODO
        return;
    }
}
