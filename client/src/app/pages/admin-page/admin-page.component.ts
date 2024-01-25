import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QuestionListModes } from '@app/enums/question-list-modes';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    questionListModes: typeof QuestionListModes = QuestionListModes;
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
}
