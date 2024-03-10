import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { questionStub } from '@app/TestStubs/question.stubs';
import { submissionStub } from '@app/TestStubs/submission.stubs';
import { JoinGameDialogComponent } from '@app/components/dialogs/join-game-dialog/join-game-dialog.component';
import { PromptDialogComponent } from '@app/components/dialogs/prompt-dialog/prompt-dialog.component';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { SecurityServicesProvider } from '@app/providers/security-services.provider';
import { AuthService } from '@app/services/auth/auth.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { SessionService } from '@app/services/session/session.service';
import { AuthPayload } from '@common/auth-payload';
import { JoinGamePayload } from '@common/join-game-payload';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
    data: BarChartData = {
        question: questionStub()[0],
        submissions: submissionStub(),
    };

    private readonly authService: AuthService;
    private readonly sessionService: SessionService;
    private readonly dialogService: MatDialog;
    private readonly snackBarService: MatSnackBar;

    private joinGameSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private readonly gameService: GameService,
        securityServicesProvider: SecurityServicesProvider,
        materialServicesProvider: MaterialServicesProvider,
        private readonly router: Router,
    ) {
        this.authService = securityServicesProvider.auth;
        this.sessionService = securityServicesProvider.session;
        this.dialogService = materialServicesProvider.dialog;
        this.snackBarService = materialServicesProvider.snackBar;
    }

    ngOnInit() {
        this.joinGameSubscription = this.gameService.onJoinGame((payload: JoinGamePayload) => {
            this.router.navigate(['waiting-room'], { queryParams: { pin: payload.pin } });
        });
    }

    ngOnDestroy() {
        if (!this.joinGameSubscription.closed) {
            this.joinGameSubscription.unsubscribe();
        }
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
