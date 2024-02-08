/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { SessionService } from '@app/services/session.service';

@Injectable({
    providedIn: 'root',
})
export class SecurityServicesProvider {
    constructor(
        private readonly _authService: AuthService,
        private readonly _sessionService: SessionService,
    ) {}

    get authService(): AuthService {
        return this._authService;
    }

    get sessionService(): SessionService {
        return this._sessionService;
    }
}
