import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { QuestionInteractionService } from '@app/services/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { QuizHttpService } from '@app/services/quiz-http.service';
import { SNACK_MESSAGE_DURATION } from '@app/constants';

const ID_LENGTH = 10;

@Component({
    selector: 'app-qcmcreation-page',
    templateUrl: './qcmcreation-page.component.html',
    styleUrls: ['./qcmcreation-page.component.scss'],
    providers: [QuestionInteractionService],
})
export class QCMCreationPageComponent implements OnInit {
    formGroup: FormGroup;
    questionsContainer: Question[] = [];
    quiz: Quiz;

    private readonly dialogService: MatDialog;
    private readonly snackBarService: MatSnackBar;

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

            this.questionSharingService.subscribe((question: Question) => {
                // eslint-disable-next-line no-underscore-dangle
                if (!this.questionsContainer.find((x) => x._id === question._id)) {
                    this.questionsContainer.push(question);
                }
            });
        });
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
                    type: 'QCM',
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

    private generateRandomString(length: number = ID_LENGTH): string {
        const lettersAndDigits = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';

        for (let i = 0; i < length; i++) {
            const randomIndex: number = Math.floor(Math.random() * lettersAndDigits.length);
            randomString += lettersAndDigits.charAt(randomIndex);
        }

        return randomString;
    }

    submitQuiz() {
        if (this.questionsContainer.length !== 0 && this.formGroup.valid) {
            const quiz: Quiz = {
                id: this.quiz? this.quiz.id : this.generateRandomString(),
                title: this.formGroup.value.title,
                description: this.formGroup.value.description,
                duration: 10,
                questions: this.questionsContainer,
                isHidden: true,
                lastModification: new Date(),
                _id: '',
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

    private setupForm(quiz?: Quiz) {
        const title = quiz?.title ? quiz.title : '';
        const description = quiz?.description ? quiz.description : '';

        this.formGroup = this.formBuilder.group({
            title: [title, Validators.required],
            description: [description, Validators.required],
        });
    }

}
