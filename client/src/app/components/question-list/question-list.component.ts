// Disabled for mongodb _id fields
/* eslint-disable no-underscore-dangle */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input } from '@angular/core';
import { QuestionListOptions } from '@app/interfaces/question-list-options';
import { QuestionInteractionService } from '@app/services/question-interaction/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing/question-sharing.service';
import { Question } from '@common/question';
import { QuestionType } from '@common/question-type';

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

    // needs to be able to work with different types of data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drop(event: CdkDragDrop<any[]>): void {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

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
        return this.sharedQuestions.includes(question);
    }

    isQcm(question: Question) {
        return question.type === QuestionType.QCM;
    }
}
