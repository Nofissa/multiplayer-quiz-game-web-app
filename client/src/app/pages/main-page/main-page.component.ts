import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { JoinGameDialogComponent } from '@app/components/dialogs/join-game-dialog/join-game-dialog.component';
import { PromptDialogComponent } from '@app/components/dialogs/prompt-dialog/prompt-dialog.component';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { SecurityServicesProvider } from '@app/providers/security-services.provider';
import { AuthService } from '@app/services/auth/auth.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { SessionService } from '@app/services/session/session.service';
import { AuthPayload } from '@common/auth-payload';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    private readonly gameService: GameService;
    private readonly playerService: PlayerService;
    private readonly authService: AuthService;
    private readonly sessionService: SessionService;
    private readonly dialogService: MatDialog;
    private readonly snackBarService: MatSnackBar;

    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        gameServicesProvider: GameServicesProvider,
        securityServicesProvider: SecurityServicesProvider,
        materialServicesProvider: MaterialServicesProvider,
        private readonly router: Router,
    ) {
        this.gameService = gameServicesProvider.gameService;
        this.playerService = gameServicesProvider.playerService;
        this.authService = securityServicesProvider.auth;
        this.sessionService = securityServicesProvider.session;
        this.dialogService = materialServicesProvider.dialog;
        this.snackBarService = materialServicesProvider.snackBar;
    }

    validateAdmin() {
        const token = this.sessionService.getSession();

        if (token) {
            this.authService.verify({ token: token ? token : '' }).subscribe({
                next: () => {
                    this.router.navigate(['/admin']);
                },
                error: () => {
                    this.promptAdminLogin();
                },
            });
        } else {
            this.promptAdminLogin();
        }
    }

    joinGame() {
        const dialogRef = this.dialogService.open(JoinGameDialogComponent, {
            width: '33%',
        });

        dialogRef.afterClosed().subscribe(({ pin, username }: { pin: string; username: string }) => {
            this.gameService.onJoinGame(pin, (player) => {
                this.playerService.setPlayer(pin, player);
                this.router.navigate(['waiting-room'], { queryParams: { pin } });
            });
            this.gameService.joinGame(pin, username);
        });
    }

    private promptAdminLogin() {
        const dialogRef = this.dialogService.open(PromptDialogComponent, {
            width: '50%',
            data: {
                title: 'Authentification',
                message: 'Veuillez entrer le mot de passe administrateur',
                placeholder: 'Mot de passe',
                value: '',
                submitText: 'Valider',
                cancelText: 'Annuler',
                hideAnswer: true,
            },
        });

        dialogRef.afterClosed().subscribe(({ value }) => {
            this.authService.login({ username: 'Admin', password: value }).subscribe({
                next: (payload: AuthPayload) => {
                    this.sessionService.setSession(payload.token);
                    this.router.navigate(['/admin']);
                },
                error: () => {
                    this.snackBarService.open("Échec de l'authentification", 'OK', {
                        verticalPosition: 'top',
                        panelClass: ['base-snackbar'],
                    });
                },
            });
        });
    }
}
