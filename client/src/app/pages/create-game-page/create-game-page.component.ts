import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-create-game-page',
    templateUrl: './create-game-page.component.html',
    styleUrls: ['./create-game-page.component.scss'],
})
export class CreateGamePageComponent {
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
}
