import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    constructor(private readonly router: Router) {}

    leaveGame() {
        //TODO RAJOUTER le socket service et transmettre l'abandon du joueur côté serveur
        this.router.navigate(['home']);
    }
}
