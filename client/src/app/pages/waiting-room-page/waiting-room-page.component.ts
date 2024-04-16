import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NOTICE_DURATION_MS } from '@app/constants/constants';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, OnDestroy {
    pin: string;
    isStarting: boolean = false;

    private readonly uuid = uuidv4();
    private readonly activatedRoute: ActivatedRoute;
    private readonly router: Router;
    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly playerService: PlayerService;

    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly snackBarService: MatSnackBar,
        routingDependenciesProvider: RoutingDependenciesProvider,
        gameServicesProvider: GameServicesProvider,
    ) {
        this.activatedRoute = routingDependenciesProvider.activatedRoute;
        this.router = routingDependenciesProvider.router;
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.playerService = gameServicesProvider.playerService;
    }

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];

        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.subscriptionService.clear(this.uuid);
    }

    leaveGame() {
        this.playerService.playerAbandon(this.pin);
        this.router.navigateByUrl('/home');
    }

    handleEndGame() {
        this.router.navigate(['results-page'], { queryParams: { pin: this.pin } });
    }

    private setupSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.pin,
            this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe({
                error: (error: HttpErrorResponse) => {
                    if (error.status === HttpStatusCode.NotFound) {
                        this.router.navigateByUrl('/home');
                    }
                },
            }),
            this.gameService.onCancelGame(pin, (message) => {
                this.snackBarService.open(message, '', {
                    duration: NOTICE_DURATION_MS,
                    verticalPosition: 'top',
                    panelClass: ['base-snackbar'],
                });

                this.router.navigateByUrl('/home');
            }),
            this.playerService.onPlayerBan(pin, (player) => {
                if (this.playerService.getCurrentPlayer(pin)?.socketId === player?.socketId) {
                    this.snackBarService.open(`Vous avez été banni de la partie ${pin}`, '', {
                        duration: NOTICE_DURATION_MS,
                        verticalPosition: 'top',
                        panelClass: ['base-snackbar'],
                    });
                    this.router.navigateByUrl('/home');
                }
            }),
            this.playerService.onPlayerAbandon(pin, (player) => {
                if (this.playerService.getCurrentPlayer(pin)?.socketId === player?.socketId) {
                    this.router.navigateByUrl('/home');
                }
            }),
            this.gameService.onStartGame(pin, () => {
                this.router.navigate(['/game'], { queryParams: { pin } });
            }),
        );
    }
}
