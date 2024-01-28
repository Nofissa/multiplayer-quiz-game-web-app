/* eslint-disable no-underscore-dangle */
import { Component, Input } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionListOptions } from '@app/interfaces/question-list-options';
import { QuestionInteractionService } from '@app/services/question-interaction.service';

@Component({
    selector: 'app-question-list',
    templateUrl: './question-list.component.html',
    styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent {
    @Input()
    questions: Question[] = [];
    @Input()
    options: QuestionListOptions;
    @Input()
    interactionService: QuestionInteractionService;

    invokeOnAddQuestion() {
        this.interactionService.invokeOnAddQuestion();
    }
}
