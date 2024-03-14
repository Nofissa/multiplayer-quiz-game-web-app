import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { Question } from '@app/interfaces/question';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { GameEventPayload } from '@common/game-event-payload';
import { Submission } from '@common/submission';

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
        this.gameService.onSendPlayerResults((chartData: GameEventPayload<{ submissions: Map<string, Submission>[]; questions: Question[] }>) => {
            this.barChartService.setData(chartData.data);
        });
    }

    get chartData(): BarChartData | undefined {
        return this.barChartService.getCurrentQuestionData();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.gameService.sendPlayerResults(this.pin);
    }

    leaveGame() {
        this.gameService.playerLeaveGameEnd(this.pin);
    }
}
