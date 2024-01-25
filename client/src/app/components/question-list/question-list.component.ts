/* eslint-disable no-underscore-dangle */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionHttpService } from '@app/services/question-http.service';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { QuestionListModes } from '@app/enums/question-list-modes';

@Component({
    selector: 'app-question-list',
    templateUrl: './question-list.component.html',
    styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent {
    @Input()
    mode: QuestionListModes;
    @Input()
    questions: Question[] = [];
    modes: typeof QuestionListModes = QuestionListModes;

    constructor(
        private readonly questionHttpService: QuestionHttpService,
        private readonly dialogService: MatDialog,
    ) {}

    openAddQuestionDialog() {
        const data: UpsertQuestionDialogData = {
            title: 'Ajouter une question',
            question: {
                _id: '',
                question: '',
                incorrectAnswers: ['', '', ''],
                correctAnswer: '',
                lastModified: new Date(),
            },
        };

        const dialogRef = this.dialogService.open(UpsertQuestionDialogComponent, {
            width: '75%',
            data,
        });

        dialogRef.afterClosed().subscribe({
            next: (result: Question) => {
                if (result) {
                    this.addQuestion(result);
                }
            },
            error: (error: HttpErrorResponse) => {
                console.error(error);
            },
        });
    }

    private addQuestion(question: Question) {
        this.questionHttpService.createQuestion(question).subscribe((response: Question) => {
            this.questions = [...this.questions, response];
        });
    }
}
