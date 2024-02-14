import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';
import { SessionService } from '@app/services/session/session.service';
import { AuthPayload } from '@common/auth-payload';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { SecurityServicesProvider } from '@app/providers/security-services.provider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromptDialogComponent } from '@app/components/dialogs/prompt-dialog/prompt-dialog.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    private readonly authService: AuthService;
    private readonly sessionService: SessionService;
    private readonly dialogService: MatDialog;
    private readonly snackBarService: MatSnackBar;

    constructor(
        securityServicesProvider: SecurityServicesProvider,
        materialServicesProvider: MaterialServicesProvider,
        private readonly router: Router,
    ) {
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
