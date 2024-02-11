import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { SessionService } from '@app/services/session.service';
import { AuthPayload } from '@common/auth-payload';
import { LoginDialogComponent } from '@app/components/dialogs/login-dialog/login-dialog.component';
import { LoginDialogData } from '@app/interfaces/login-dialog-data';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { SecurityServicesProvider } from '@app/providers/security-services.provider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

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
        const dialogRef = this.dialogService.open(LoginDialogComponent, {
            width: '50%',
            data: { password: '' },
        });

        dialogRef.afterClosed().subscribe((data: LoginDialogData) => {
            this.authService.login({ username: 'Admin', password: data.password }).subscribe({
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
