import { Injectable } from '@angular/core';
import { AuthService } from '@app/services/auth/auth.service';
import { SessionService } from '@app/services/session/session.service';

@Injectable({
    providedIn: 'root',
})
export class SecurityServicesProvider {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionService: SessionService,
    ) {}

    get auth(): AuthService {
        return this.authService;
    }

    get session(): SessionService {
        return this.sessionService;
    }
}
