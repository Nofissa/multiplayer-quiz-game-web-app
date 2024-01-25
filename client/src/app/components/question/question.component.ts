/* eslint-disable no-underscore-dangle */
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Question } from '@app/interfaces/question';
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { QuestionHttpService } from '@app/services/question-http.service';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { QuestionListModes } from '@app/enums/question-list-modes';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input()
    question: Question;
    @Input()
    mode: QuestionListModes;
    modes: typeof QuestionListModes = QuestionListModes;
    isShared: boolean = false;
    isDeleted: boolean = false;

    constructor(
        private readonly questionHttpService: QuestionHttpService,
        private readonly questionSharingService: QuestionSharingService,
        private readonly dialogService: MatDialog,
    ) {}

    openEditQuestionDialog() {
        const dialogRef = this.dialogService.open(UpsertQuestionDialogComponent, {
            width: '75%',
            data: {
                title: 'Modifier une question',
                question: this.question,
            },
        });

        dialogRef.afterClosed().subscribe((result: Question) => {
            if (result) {
                this.edit({
                    ...this.question,
                    question: result.question,
                    incorrectAnswers: result.incorrectAnswers,
                    correctAnswer: result.correctAnswer,
                });
            }
        });
    }

    openDeleteQuestionDialog() {
        const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
            width: '30%',
            data: {
                title: 'Supprimer la question',
                prompt: 'Êtes vous certains de vouloir supprimer la question?',
            },
        });

        dialogRef.afterClosed().subscribe((isSubmited: boolean) => {
            if (isSubmited) {
                this.delete();
            }
        });
    }

    share() {
        this.questionSharingService.share(this.question);
    }

    private edit(question: Question) {
        this.questionHttpService.updateQuestion(question).subscribe((response: Question) => {
            if (response) {
                this.question = { ...response };
            }
        });
    }

    private delete() {
        this.questionHttpService.deleteQuestionById(this.question._id).subscribe((response: Question) => {
            if (response._id === this.question._id) {
                this.isDeleted = true;
            }
        });
    }
}
