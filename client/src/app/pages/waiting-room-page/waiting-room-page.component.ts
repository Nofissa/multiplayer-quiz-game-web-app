import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameService } from '@app/services/game/game-service/game.service';
import { Subscription } from 'rxjs';

const CANCEL_GAME_NOTICE_DURATION_MS = 5000;

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, OnDestroy {
    pin: string;
    isStarting: boolean = false;

    private eventSubscriptions: Subscription[] = [];

    private readonly gameService: GameService;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly snackBarService: MatSnackBar,
        gameServicesProvider: GameServicesProvider,
    ) {
        this.gameService = gameServicesProvider.gameService;
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (!sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    leaveGame() {
        this.gameService.playerAbandon(this.pin);
        this.router.navigate(['/home']);
    }

    private setupSubscriptions(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onCancelGame(pin, (message) => {
                this.snackBarService.open(message, '', {
                    duration: CANCEL_GAME_NOTICE_DURATION_MS,
                    verticalPosition: 'top',
                    panelClass: ['base-snackbar'],
                });

                this.router.navigateByUrl('/home');
            }),

            this.gameService.onStartGame(pin, () => {
                this.router.navigate(['/game'], { queryParams: { pin } });
            }),
        );
    }
}
