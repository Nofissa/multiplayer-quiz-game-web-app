import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { SessionService } from '@app/services/session.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(
        private readonly authService: AuthService,
        private readonly sessionService: SessionService,
        private readonly router: Router,
    ) {}

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
}
