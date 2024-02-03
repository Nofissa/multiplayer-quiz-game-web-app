/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { Question } from '@app/interfaces/question';
import { QuestionListOptions } from '@app/interfaces/question-list-options';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { QuestionHttpService } from '@app/services/question-http.service';
import { QuestionInteractionService } from '@app/services/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing.service';

const NOT_FOUND_INDEX = -1;

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
    providers: [QuestionInteractionService],
})
export class QuestionBankComponent implements OnInit {
    @Input()
    options: QuestionListOptions;

    questions: Question[] = [];

    // eslint-disable-next-line max-params
    constructor(
        readonly interactionService: QuestionInteractionService,
        private readonly questionHttpService: QuestionHttpService,
        private readonly questionSharingService: QuestionSharingService,
        private readonly dialogService: MatDialog,
    ) {}

    ngOnInit() {
        this.loadQuestions();

        this.questionSharingService.subscribe((question: Question) => {
            if (!this.questions.find((x) => x._id === question._id)) {
                this.addQuestion(question);
            }
        });

        this.interactionService.registerOnAddQuestion(() => {
            this.openAddQuestionDialog();
        });
        this.interactionService.registerOnEditQuestion((question: Question) => {
            this.openEditQuestionDialog(question);
        });
        this.interactionService.registerOnDeleteQuestion((question: Question) => {
            this.openDeleteQuestionDialog(question);
        });
        this.interactionService.registerOnShareQuestion((question: Question) => {
            this.shareQuestion(question);
        });
    }

    openAddQuestionDialog() {
        const data: UpsertQuestionDialogData = {
            title: 'Ajouter une question',
            question: {
                _id: '',
                type: 'QCM',
                text: '',
                choices: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                ],
                points: 10,
                lastModification: new Date(),
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
        });
    }

    openEditQuestionDialog(question: Question) {
        const dialogRef = this.dialogService.open(UpsertQuestionDialogComponent, {
            width: '75%',
            data: {
                title: 'Modifier une question',
                question,
            },
        });

        dialogRef.afterClosed().subscribe((result: Question) => {
            if (result) {
                this.updateQuestion({
                    ...question,
                    text: result.text,
                    choices: result.choices,
                    points: result.points,
                });
            }
        });
    }

    openDeleteQuestionDialog(question: Question) {
        const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
            width: '30%',
            data: {
                title: 'Supprimer la question',
                prompt: 'Êtes vous certains de vouloir supprimer la question?',
            },
        });

        dialogRef.afterClosed().subscribe((isSubmited: boolean) => {
            if (isSubmited) {
                this.deleteQuestion(question);
            }
        });
    }

    private loadQuestions() {
        this.questionHttpService.getAllQuestions().subscribe((questions: Question[]) => {
            this.questions = questions;
        });
    }

    private addQuestion(question: Question) {
        this.questionHttpService.createQuestion(question).subscribe((response: Question) => {
            this.questions = [response, ...this.questions];
        });
    }

    private updateQuestion(question: Question) {
        this.questionHttpService.updateQuestion(question).subscribe((response: Question) => {
            const updatedIndex = this.questions.findIndex((x) => x._id === response._id);

            if (updatedIndex !== NOT_FOUND_INDEX) {
                this.questions[updatedIndex] = response;
            }
        });
    }

    private deleteQuestion(question: Question) {
        this.questionHttpService.deleteQuestionById(question._id).subscribe(() => {
            const deletedIndex = this.questions.findIndex((x) => x._id === question._id);

            if (deletedIndex !== NOT_FOUND_INDEX) {
                this.questions.splice(deletedIndex, 1);
            }
        });
    }

    private shareQuestion(question: Question) {
        this.questionSharingService.share(question);
    }
}
