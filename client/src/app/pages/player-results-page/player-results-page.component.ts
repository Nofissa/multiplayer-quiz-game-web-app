import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
})
export class PlayerResultsPageComponent implements OnInit {
    private pin: string;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly gameService: GameService,
        private readonly barChartService: BarChartService,
    ) {
        this.gameService.onSendPlayerResults((chartData: BarChartData[]) => {
            this.setBarChartData(chartData);
        });
    }

    get chartData(): BarChartData[] {
        return this.barChartService.getAllBarChart();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
    }

    leaveGame() {
        this.gameService.playerLeaveGameEnd(this.pin);
    }

    private setBarChartData(chartData: BarChartData[]) {
        this.barChartService.setData(chartData);
    }
}
