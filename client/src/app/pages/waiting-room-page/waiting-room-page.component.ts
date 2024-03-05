import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from '@app/interfaces/question';
import { GameService } from '@app/services/game/game-service/game.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit {
    private pin: string;

    // Dissabled lint due to the extra number of unrelated services needed here
    // eslint-disable-next-line max-params
    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly gameService: GameService,
    ) {}

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.gameService.onStartGame((question: Question) => {
            this.handleStartGame(question);
        });
    }

    leaveGame() {
        this.gameService.playerAbandon(this.pin);
        this.router.navigate(['home']);
    }

    handleStartGame(question: Question) {
        this.router.navigate(['game'], { queryParams: { pin: this.pin } });
    }
}
