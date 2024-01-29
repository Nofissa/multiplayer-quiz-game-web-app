/* eslint-disable no-underscore-dangle */
import { Component, Input } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionListOptions } from '@app/interfaces/question-list-options';
import { QuestionInteractionService } from '@app/services/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing.service';

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

    sharedQuestions: Question[] = [];

    constructor(private readonly questionSharingService: QuestionSharingService) {}

    invokeOnAddQuestion() {
        this.interactionService.invokeOnAddQuestion();
    }

    invokeOnEditQuestion(question: Question) {
        this.interactionService.invokeOnEditQuestion(question);
    }

    invokeOnDeleteQuestion(question: Question) {
        this.interactionService.invokeOnDeleteQuestion(question);
    }

    share(question: Question) {
        if (!this.isShared(question)) {
            this.questionSharingService.share(question);
            this.sharedQuestions.push(question);
        }
    }

    isShared(question: Question) {
        return this.sharedQuestions.some((x) => x._id === question._id);
    }
}
