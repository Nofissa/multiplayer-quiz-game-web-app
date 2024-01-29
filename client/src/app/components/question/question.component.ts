import { Component, Input } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionListOptions } from '@app/interfaces/question-list-options';
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { QuestionInteractionService } from '@app/services/question-interaction.service';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input()
    question: Question;
    @Input()
    options: QuestionListOptions;
    @Input()
    interactionService: QuestionInteractionService;

    isShared: boolean;

    constructor(private readonly questionSharingService: QuestionSharingService) {}

    invokeOnEditQuestion() {
        this.interactionService.invokeOnEditQuestion(this.question);
    }

    invokeOnDeleteQuestion() {
        this.interactionService.invokeOnDeleteQuestion(this.question);
    }

    share() {
        if (!this.isShared) {
            this.questionSharingService.share(this.question);
            this.isShared = true;
        }
    }
}
