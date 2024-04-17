// for mongodb's _id fields
/* eslint-disable no-underscore-dangle */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { DEFAULT_QUIZ_DURATION, ID_LENGTH, SNACK_MESSAGE_DURATION } from '@app/constants/constants';
import { Quiz } from '@common/quiz';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { QuestionInteractionService } from '@app/services/question-interaction/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing/question-sharing.service';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { Question } from '@common/question';
import { Subscription } from 'rxjs';
import { QuestionType } from '@common/question-type';

@Component({
    selector: 'app-qcm-creation-page',
    templateUrl: './qcm-creation-page.component.html',
    styleUrls: ['./qcm-creation-page.component.scss'],
    providers: [QuestionInteractionService],
})
export class QCMCreationPageComponent implements OnInit, OnDestroy {
    formGroup: FormGroup;
    questionsContainer: Question[] = [];
    quiz: Quiz;

    private shareSubscription: Subscription = new Subscription();
    private readonly dialogService: MatDialog;
    private readonly snackBarService: MatSnackBar;

    // needs multiple services to work correctly
    // eslint-disable-next-line max-params
    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly activatedRoute: ActivatedRoute,
        private readonly quizHttpService: QuizHttpService,
        private readonly questionSharingService: QuestionSharingService,
        readonly questionInteractionService: QuestionInteractionService,
        materialServicesProvider: MaterialServicesProvider,
    ) {
        this.dialogService = materialServicesProvider.dialog;
        this.snackBarService = materialServicesProvider.snackBar;
    }

    ngOnInit() {
        this.activatedRoute.queryParamMap.subscribe((paramMap: ParamMap) => {
            const quizId = paramMap.get('quizId');

            this.setupForm();

            if (quizId) {
                this.quizHttpService.getQuizById(quizId).subscribe((quiz: Quiz) => {
                    if (quiz) {
                        this.quiz = quiz;
                        this.questionsContainer = this.quiz.questions;
                        this.setupForm(this.quiz);
                    }
                });
            }

            this.questionInteractionService.registerOnAddQuestion(() => {
                this.addQuestion();
            });

            this.questionInteractionService.registerOnShareQuestion((question: Question) => {
                this.questionSharingService.share(question);
            });

            this.questionInteractionService.registerOnDeleteQuestion((question: Question) => {
                this.deleteQuestion(question);
            });

            this.questionInteractionService.registerOnEditQuestion((question: Question) => {
                const dialogRef = this.dialogService.open(UpsertQuestionDialogComponent, {
                    data: { title: 'Modifier une question', question },
                });
                dialogRef.afterClosed().subscribe({
                    next: (data: Question) => {
                        if (data) {
                            question.text = data.text;
                            question.choices = data.choices;
                            question.points = data.points;
                            question.lastModification = data.lastModification;
                        }
                    },
                });
            });

            this.shareSubscription = this.questionSharingService.subscribe((question: Question) => {
                if (this.questionsContainer.every((x) => x.text !== question.text)) {
                    this.questionsContainer.push(question);
                }
            });
        });
    }

    ngOnDestroy(): void {
        if (!this.shareSubscription?.closed) {
            this.shareSubscription.unsubscribe();
        }
    }

    deleteQuestion(question: Question) {
        if (question) {
            this.questionsContainer = this.questionsContainer.filter((x) => x.text !== question.text);
        }
    }

    addQuestion() {
        const dialogRef = this.dialogService.open(UpsertQuestionDialogComponent, {
            data: {
                title: 'Créer une Question',
                question: {
                    type: QuestionType.QCM,
                    text: '',
                    choices: [
                        {
                            text: '',
                            isCorrect: true,
                        },
                        {
                            text: '',
                            isCorrect: false,
                        },
                    ],
                    lastModification: new Date(),
                    points: 10,
                    _id: '',
                },
            },
        });
        dialogRef.afterClosed().subscribe({
            next: (data: Question) => {
                if (data) {
                    this.questionsContainer.push(data);
                }
            },
        });
    }

    submitQuiz() {
        if (this.questionsContainer.length !== 0 && this.formGroup.valid) {
            const quiz: Quiz = {
                id: this.quiz ? this.quiz.id : this.generateRandomString(),
                title: this.formGroup.value.title,
                description: this.formGroup.value.description,
                duration: this.formGroup.value.duration,
                questions: this.questionsContainer,
                isHidden: true,
                lastModification: new Date(),
                // for mongodb id
                // eslint-disable-next-line no-underscore-dangle
                _id: this.quiz ? this.quiz._id : '',
            };

            if (this.quiz) {
                this.quizHttpService.updateQuiz(quiz).subscribe({
                    next: (updatedQuiz: Quiz) => {
                        this.quiz = updatedQuiz;
                        this.snackBarService.open('Le quiz a été enregistré avec succès', '', { duration: SNACK_MESSAGE_DURATION });
                    },
                    error: () => {
                        this.snackBarService.open("Le quiz n'a pas pu être modifié", '', { duration: SNACK_MESSAGE_DURATION });
                    },
                });
            } else {
                this.quizHttpService.createQuiz(quiz).subscribe({
                    next: (createdQuiz: Quiz) => {
                        this.quiz = createdQuiz;
                        this.snackBarService.open('Le quiz a été enregistré avec succès', '', { duration: SNACK_MESSAGE_DURATION });
                    },
                    error: () => {
                        this.snackBarService.open("Le quiz n'a pas pu être créer", '', { duration: SNACK_MESSAGE_DURATION });
                    },
                });
            }
        } else {
            this.snackBarService.open("L'un des paramètres est erroné, veuillez réessayer", '', { duration: SNACK_MESSAGE_DURATION });
        }
    }

    private generateRandomString(length: number = ID_LENGTH): string {
        const lettersAndDigits = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';

        for (let i = 0; i < length; i++) {
            const randomIndex: number = Math.floor(Math.random() * lettersAndDigits.length);
            randomString += lettersAndDigits.charAt(randomIndex);
        }

        return randomString;
    }

    private setupForm(quiz?: Quiz) {
        const title = quiz?.title ? quiz.title : '';
        const description = quiz?.description ? quiz.description : '';
        const duration = quiz?.duration ? quiz.duration : DEFAULT_QUIZ_DURATION;

        this.formGroup = this.formBuilder.group({
            title: [title, Validators.required],
            description: [description, Validators.required],
            duration: [duration, Validators.required],
        });
    }
}
