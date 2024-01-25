/* eslint-disable no-underscore-dangle */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionHttpService } from '@app/services/question-http.service';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { QuestionListModes } from '@app/enums/question-list-modes';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent implements OnInit {
    @Input()
    mode: QuestionListModes;
    modes: typeof QuestionListModes = QuestionListModes;
    _questions: Question[] = [];

    constructor(
        private readonly questionHttpService: QuestionHttpService,
        private readonly dialogService: MatDialog,
    ) {}

    get questions(): Question[] {
        return this._questions;
    }

    ngOnInit() {
        this.fetchQuestions();
    }

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
            this.setQuestions([...this.questions, response]);
        });
    }

    private fetchQuestions() {
        this.questionHttpService.getAllQuestions().subscribe({
            next: (response: Question[]) => {
                this.setQuestions(response);
            },
            error: (error: HttpErrorResponse) => {
                console.error(error);
            },
        });
    }

    private setQuestions(questions: Question[]) {
        this._questions = questions.sort((a, b) => a.lastModified.getUTCDate() - b.lastModified.getUTCDate());
    }
}
