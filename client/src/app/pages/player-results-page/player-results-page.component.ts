import { Component } from '@angular/core';
import { HistogrammeData } from '@app/interfaces/histogram-data';

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
})
export class PlayerResultsPageComponent {
    answers: HistogrammeData[] = [
        {
            question: 'hee',
            choices: [
                {
                    text: 'choice',
                    playersSelected: 10,
                    isCorrect: true,
                },
                {
                    text: 'choice',
                    playersSelected: 10,
                    isCorrect: true,
                },
                {
                    text: 'choice',
                    playersSelected: 10,
                    isCorrect: false,
                },
                {
                    text: 'choice',
                    playersSelected: 10,
                    isCorrect: false,
                },
            ],
        },
        {
            question: 'hee',
            choices: [
                {
                    text: 'choice',
                    playersSelected: 10,
                    isCorrect: true,
                },
            ],
        },
    ];
    numberOfPlayers: number = 30;
}
