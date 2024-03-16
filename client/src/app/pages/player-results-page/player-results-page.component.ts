import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
})
export class PlayerResultsPageComponent implements OnInit {
    pin: string;

    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly gameHttpService: GameHttpService,
        private readonly gameService: GameService,
        private readonly barChartService: BarChartService,
    ) {}

    get chartData(): BarChartData | undefined {
        return this.barChartService.getCurrentQuestionData();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.barChartService.setData({ submissions: snapshot.questionSubmissions, questions: snapshot.quiz.questions });
        });
    }

    leaveGame() {
        this.gameService.playerLeaveGameEnd(this.pin);
    }
}
