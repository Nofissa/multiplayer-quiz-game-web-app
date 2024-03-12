import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, OnDestroy {
    pin: string;
    isStarting: boolean = false;

    private startTimerSubscription: Subscription = new Subscription();
    private timerTickSubscription: Subscription = new Subscription();

    private readonly gameService: GameService;
    private readonly timerService: TimerService;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        gameServicesProvider: GameServicesProvider,
    ) {
        this.gameService = gameServicesProvider.gameService;
        this.timerService = gameServicesProvider.timerService;
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];

        this.startTimerSubscription = this.timerService.onStartTimer(this.pin, () => {
            this.isStarting = true;
        });
        this.timerTickSubscription = this.timerService.onTimerTick(this.pin, (remainingTime) => {
            if (remainingTime === 0) {
                this.router.navigate(['/game'], { queryParams: { pin: this.pin } });
            }
        });
    }

    ngOnDestroy() {
        if (!this.startTimerSubscription.closed) {
            this.startTimerSubscription.unsubscribe();
        }
        if (!this.timerTickSubscription.closed) {
            this.timerTickSubscription.unsubscribe();
        }
    }

    leaveGame() {
        this.gameService.playerAbandon(this.pin);
        this.router.navigate(['/home']);
    }
}
