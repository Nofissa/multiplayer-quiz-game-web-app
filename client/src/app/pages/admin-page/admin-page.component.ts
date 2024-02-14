import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityServicesProvider } from '@app/providers/security-services.provider';
import { AuthService } from '@app/services/auth/auth.service';
import { SessionService } from '@app/services/session/session.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AdminPageComponent implements OnInit {
    private readonly authService: AuthService;
    private readonly sessionService: SessionService;

    constructor(
        securityServicesProvider: SecurityServicesProvider,
        private readonly router: Router,
    ) {
        this.authService = securityServicesProvider.auth;
        this.sessionService = securityServicesProvider.session;
    }

    ngOnInit() {
        const token = this.sessionService.getSession();

        if (token) {
            this.authService.verify({ token }).subscribe({
                error: () => {
                    this.router.navigateByUrl('/');
                },
            });
        } else {
            this.router.navigateByUrl('/');
        }
    }

    getSession() {
        return this.sessionService;
    }
}
