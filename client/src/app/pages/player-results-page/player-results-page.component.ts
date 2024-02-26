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
}
