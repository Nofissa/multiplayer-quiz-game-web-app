import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question } from '@common/question';
import { Player } from '@common/player';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    pin: string;
    question: Question | null;
    player: Player | null;
    isTest: boolean;

    constructor(private readonly activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.isTest = this.activatedRoute.snapshot.queryParams['isTest'] === 'true';
    }
}
