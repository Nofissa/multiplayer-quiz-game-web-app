import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { questionStub } from '@app/TestStubs/question.stubs';
import { submissionStub } from '@app/TestStubs/submission.stubs';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Subscription } from 'rxjs';
import { GameService } from '@app/services/game/game-service/game.service';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
})
export class PlayerResultsPageComponent implements OnInit, OnDestroy {
    pin: string;
    // temporary until web socket service for histogram is implemented
    data: BarChartData[] = [
        {
            question: questionStub()[0],
            submissions: submissionStub(),
        },
        {
            question: questionStub()[1],
            submissions: submissionStub(),
        },
    ];

    private eventSubscriptions: Subscription[] = [];

    private readonly activatedRoute: ActivatedRoute;
    private readonly router: Router;

    constructor(
        private readonly gameService: GameService,
        private readonly webSocketService: WebSocketService,
        routingDependenciesProvider: RoutingDependenciesProvider,
    ) {
        this.activatedRoute = routingDependenciesProvider.activatedRoute;
        this.router = routingDependenciesProvider.router;
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (!sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    getChartDiagramData() {
        this.webSocketService.emit('getChartDiagramData', { pin: this.pin });
    }

    private setupSubscriptions(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onNextQuestion(pin, () => {
                this.router.navigate(['game'], { queryParams: { pin } });
            }),
        );
    }
}
