// for mongo db ids
/* eslint-disable no-underscore-dangle */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { NOTICE_DURATION_MS, NOT_FOUND_INDEX } from '@app/constants/constants';
import { QuestionListOptions } from '@app/interfaces/question-list-options';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { QuestionServicesProvider } from '@app/providers/question-services.provider';
import { QuestionHttpService } from '@app/services/question-http/question-http.service';
import { QuestionInteractionService } from '@app/services/question-interaction/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing/question-sharing.service';
import { Question } from '@common/question';
import { QuestionType } from '@common/question-type';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
    providers: [QuestionInteractionService],
})
export class QuestionBankComponent implements OnInit, OnDestroy {
    @Input()
    options: QuestionListOptions;

    questions: Question[] = [];
    displayedQuestions: Question[] = [];

    private shareSubscription: Subscription = new Subscription();
    private changeSubscription: Subscription;

    private readonly dialogService: MatDialog;
    private readonly snackBarService: MatSnackBar;
    private readonly questionSharingService: QuestionSharingService;
    private readonly questionHttpService: QuestionHttpService;

    constructor(
        materialServicesProvider: MaterialServicesProvider,
        questionServicesProvider: QuestionServicesProvider,
        readonly questionInteractionService: QuestionInteractionService,
    ) {
        this.dialogService = materialServicesProvider.dialog;
        this.snackBarService = materialServicesProvider.snackBar;
        this.questionHttpService = questionServicesProvider.questionHttp;
        this.questionSharingService = questionServicesProvider.questionSharing;
    }

    ngOnInit() {
        this.loadQuestions();
        this.setupServices();
        this.changeSubscription = this.questionHttpService.onChange((questions) => {
            this.questions = questions;
            this.displayedQuestions = questions;
        });
    }

    ngOnDestroy() {
        this.shareSubscription?.unsubscribe();
        this.changeSubscription?.unsubscribe();
    }

    openAddQuestionDialog() {
        const data: UpsertQuestionDialogData = {
            title: 'Ajouter une question',
            question: {
                _id: '',
                type: QuestionType.QCM,
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

    filterQuestions(type: string) {
        if (type.trim().toUpperCase() === 'QCM' || type.trim().toUpperCase() === 'QRL') {
            this.displayedQuestions = this.questions.filter(
                (question) => question.type === (type.trim().toUpperCase() === 'QCM' ? QuestionType.QCM : QuestionType.QRL),
            );
        } else {
            this.displayedQuestions = this.questions;
        }
    }

    private setupServices() {
        this.shareSubscription = this.questionSharingService.subscribe((sharedQuestion: Question) => {
            if (!this.questions.includes(sharedQuestion)) {
                this.addQuestion(sharedQuestion);
            }
        });

        this.questionInteractionService.registerOnAddQuestion(() => {
            this.openAddQuestionDialog();
        });

        this.questionInteractionService.registerOnEditQuestion((question: Question) => {
            this.openEditQuestionDialog(question);
        });

        this.questionInteractionService.registerOnDeleteQuestion((question: Question) => {
            this.openDeleteQuestionDialog(question);
        });

        this.questionInteractionService.registerOnShareQuestion((question: Question) => {
            this.shareQuestion(question);
        });
    }

    private loadQuestions() {
        this.questionHttpService.getAllQuestions().subscribe((questions: Question[]) => {
            this.questions = questions;
            this.displayedQuestions = questions;
        });
    }

    private addQuestion(question: Question) {
        this.questionHttpService.createQuestion(question).subscribe({
            next: (response: Question) => {
                this.questions = [response, ...this.questions];
            },
            error: () => {
                this.snackBarService.open("Échec de l'ajout de la question à la Banque de Questions", 'OK', {
                    verticalPosition: 'top',
                    panelClass: ['base-snackbar'],
                    duration: NOTICE_DURATION_MS,
                });
            },
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
