import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { questionStub } from '@app/TestStubs/question.stubs';
import { submissionStub } from '@app/TestStubs/submission.stubs';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
})
export class PlayerResultsPageComponent implements OnInit {
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

    private pin: string;

    constructor(
        private readonly webSocketService: WebSocketService,
        private readonly activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
    }

    getChartDiagramData() {
        this.webSocketService.emit('getChartDiagramData', { pin: this.pin });
    }
}
