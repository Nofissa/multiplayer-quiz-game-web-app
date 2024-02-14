import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    private readonly tokenKey = 'authToken';

    setSession(token: string) {
        localStorage.setItem(this.tokenKey, token);
    }

    getSession(): string | null {
        return localStorage.getItem(this.tokenKey);
    }
}
