import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question } from '@app/interfaces/question';
import { GameCacheService } from '@app/services/game-cache/game-cache.service';
import { GameService } from '@app/services/game/game-service/game.service';
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

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly gameCacheService: GameCacheService,
    ) {}

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.isTest = this.activatedRoute.snapshot.queryParams['isTest'] === 'true';
        this.question = this.gameCacheService.getCurrentQuestion(this.pin);
        this.player = this.gameCacheService.getSelfPlayer(this.pin);
    }
}
