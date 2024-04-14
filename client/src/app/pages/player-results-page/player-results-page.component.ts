import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { PlayerService } from '@app/services/player/player.service';

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
})
export class PlayerResultsPageComponent implements OnInit {
    pin: string;

    private readonly activatedRoute: ActivatedRoute;
    private readonly router: Router;
    private readonly gameHttpService: GameHttpService;
    private readonly playerService: PlayerService;

    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        private readonly barChartService: BarChartService,
        routingDependenciesProvider: RoutingDependenciesProvider,
        gameServicesProvider: GameServicesProvider,
    ) {
        this.activatedRoute = routingDependenciesProvider.activatedRoute;
        this.router = routingDependenciesProvider.router;
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.playerService = gameServicesProvider.playerService;
    }

    get chartData(): BarChartData[] | undefined {
        return this.barChartService.getAllBarChart();
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];

        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe({
            next: (snapshot) => {
                this.barChartService.setData(snapshot);
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.leaveGame();
                }
            },
        });
    }

    leaveGame() {
        this.playerService.playerAbandon(this.pin);
        this.router.navigateByUrl('/home');
    }
}
