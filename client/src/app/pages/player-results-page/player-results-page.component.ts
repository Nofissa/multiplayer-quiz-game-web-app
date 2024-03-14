import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { GameEventPayload } from '@common/game-event-payload';
import { Question } from '@common/question';
import { Submission } from '@common/submission';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
})
export class PlayerResultsPageComponent implements OnInit, OnDestroy {
    pin: string;
    private eventSubscriptions: Subscription[] = [];
    private readonly router: Router;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly gameService: GameService,
        private readonly barChartService: BarChartService,
    ) {
        this.gameService.onSendPlayerResults((chartData: GameEventPayload<{ submissions: Map<string, Submission>[]; questions: Question[] }>) => {
            this.barChartService.setData(chartData.data);
        });
        this.gameService.sendPlayerResults(this.pin);
    }

    get chartData(): BarChartData | undefined {
        return this.barChartService.getCurrentQuestionData();
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

    leaveGame() {
        this.gameService.playerLeaveGameEnd(this.pin);
    }

    private setupSubscriptions(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onNextQuestion(pin, () => {
                this.router.navigate(['game'], { queryParams: { pin } });
            }),
        );
    }
}
