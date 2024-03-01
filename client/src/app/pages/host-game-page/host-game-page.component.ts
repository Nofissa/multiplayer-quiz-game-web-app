import { Component } from '@angular/core';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarChartService } from '@app/services/game/barChart-service/barChart.service';
import { GameService } from '@app/services/game/game-service/game.service';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent {
    answers: BarChartData[] = [];
    numberOfPlayers: number = 30;

    constructor(
        private readonly gameService: GameService,
        private readonly barChartService: BarChartService,
    ) {
        this.gameService.onToggleSelectChoice(this.barChartService.updateBarChartData);
        this.gameService.onNextQuestion(this.barChartService.addQuestion);
    }
}
