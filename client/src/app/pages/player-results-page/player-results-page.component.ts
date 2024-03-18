import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { Player } from '@common/player';

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
})
export class PlayerResultsPageComponent implements OnInit {
    pin: string;
    players: Player[] = [];
    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly gameHttpService: GameHttpService,
        private readonly router: Router,
        private readonly barChartService: BarChartService,
    ) {}

    get chartData(): BarChartData[] | undefined {
        return this.barChartService.getAllBarChart();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.barChartService.setData({ submissions: snapshot.questionSubmissions, questions: snapshot.quiz.questions });
            this.players = snapshot.players;
        });
    }

    leaveGame() {
        this.router.navigateByUrl('/home');
    }
}
