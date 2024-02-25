import { Component, ViewEncapsulation } from '@angular/core';
import { HistogrammeData } from '@app/interfaces/histogram-data';
import SwiperCore, { EffectCoverflow, Navigation, Pagination } from 'swiper';

SwiperCore.use([Navigation, Pagination, EffectCoverflow]);

@Component({
    selector: 'app-player-results-page',
    templateUrl: './player-results-page.component.html',
    styleUrls: ['./player-results-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class PlayerResultsPageComponent {
    answers: HistogrammeData[] = [
        {
            question: 'hee',
            choices: [
                {
                    text: 'choice',
                    playersSelected: 10,
                },
                {
                    text: 'choice',
                    playersSelected: 10,
                },
                {
                    text: 'choice',
                    playersSelected: 10,
                },
                {
                    text: 'choice',
                    playersSelected: 10,
                },
            ],
        },
        {
            question: 'hee',
            choices: [
                {
                    text: 'choice',
                    playersSelected: 10,
                },
            ],
        },
    ];
    numberOfPlayers: number = 10;
}
