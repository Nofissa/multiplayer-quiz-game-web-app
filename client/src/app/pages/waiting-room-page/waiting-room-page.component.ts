import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { RoutingDependenciesProvider } from '@app/providers/routing-dependencies.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { Subscription } from 'rxjs';

const NOTICE_DURATION_MS = 5000;

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, OnDestroy {
    pin: string;
    isStarting: boolean = false;

    private eventSubscriptions: Subscription[] = [];

    private readonly activatedRoute: ActivatedRoute;
    private readonly router: Router;
    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly playerService: PlayerService;

    constructor(
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

        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe({
            error: (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.router.navigateByUrl('/home');
                }
            },
        });

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
        this.router.navigateByUrl('/home');
    }

    handleEndGame() {
        this.router.navigate(['results-page'], { queryParams: { pin: this.pin } });
    }

    private setupSubscriptions(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onCancelGame(pin, (message) => {
                this.snackBarService.open(message, '', {
                    duration: NOTICE_DURATION_MS,
                    verticalPosition: 'top',
                    panelClass: ['base-snackbar'],
                });

                this.router.navigateByUrl('/home');
            }),

            this.gameService.onPlayerBan(pin, (player) => {
                if (this.playerService.getCurrentPlayer(pin)?.socketId === player.socketId) {
                    this.snackBarService.open(`Vous avez été banni de la partie ${pin}`, '', {
                        duration: NOTICE_DURATION_MS,
                        verticalPosition: 'top',
                        panelClass: ['base-snackbar'],
                    });
                    this.router.navigateByUrl('/home');
                }
            }),

            this.gameService.onPlayerAbandon(pin, (player) => {
                if (this.playerService.getCurrentPlayer(pin)?.socketId === player.socketId) {
                    this.router.navigateByUrl('/home');
                }
            }),

            this.gameService.onStartGame(pin, () => {
                this.router.navigate(['/game'], { queryParams: { pin } });
            }),
        );
    }
}
