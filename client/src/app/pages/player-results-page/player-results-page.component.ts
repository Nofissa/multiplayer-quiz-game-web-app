import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarChartData } from '@app/interfaces/histogram-data';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
})
export class PlayerResultsPageComponent implements OnInit {
    // temporary until web socket service for histogram is implemented
    answers: BarChartData[] = [
        {
            question: 'hee',
            choices: [
                {
                    choice: { text: 'choice', isCorrect: true },
                    playersSelected: 10,
                },
                {
                    choice: { text: 'choice', isCorrect: true },
                    playersSelected: 10,
                },
                {
                    choice: { text: 'choice', isCorrect: false },
                    playersSelected: 10,
                },
                {
                    choice: { text: 'choice', isCorrect: false },
                    playersSelected: 10,
                },
            ],
        },
        {
            question: 'hee',
            choices: [
                {
                    choice: { text: 'choice', isCorrect: true },
                    playersSelected: 10,
                },
            ],
        },
    ];
    numberOfPlayers: number = 30;

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
