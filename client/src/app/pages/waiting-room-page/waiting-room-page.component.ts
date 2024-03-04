import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';

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
        private readonly timerService: TimerService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly gameService: GameService,
    ) {}

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.timerService.startTimer(this.pin);
    }

    leaveGame() {
        this.gameService.playerAbandon(this.pin);
        this.router.navigate(['home']);
    }
}
