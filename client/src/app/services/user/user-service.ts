import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
    private username: string;

    setUsername(username: string) {
        this.username = username;
    }

    getUsername(): string {
        return this.username;
    }
}
