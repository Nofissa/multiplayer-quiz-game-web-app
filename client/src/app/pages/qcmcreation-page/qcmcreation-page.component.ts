import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { QuestionInteractionService } from '@app/services/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { QuizHttpService } from '@app/services/quiz-http.service';
import { SNACK_MESSAGE_DURATION } from '@app/constants';

const ID_LENGTH = 10;

@Component({
    selector: 'app-qcmcreation-page',
    templateUrl: './qcmcreation-page.component.html',
    styleUrls: ['./qcmcreation-page.component.scss'],
    providers: [QuestionInteractionService, QuizHttpService],
})
export class QCMCreationPageComponent implements OnInit {
    formGroup: FormGroup;
    questionsContainer: Question[] = [];
    quizId: string = '';
    quiz: Quiz;

    // eslint-disable-next-line max-params
    constructor(
        private formBuilder: FormBuilder,
        private dialogService: MatDialog,
        public questionInteractionService: QuestionInteractionService,
        private questionSharingService: QuestionSharingService,
        private quizHttpService: QuizHttpService,
        private activatedRoute: ActivatedRoute,
        private snackBar: MatSnackBar,
    ) {}

    get questions(): FormArray {
        return this.formGroup.get('questions') as FormArray;
    }

    ngOnInit() {
        console.log('ngOnInit called');
        this.activatedRoute.queryParamMap.subscribe((paramMap: ParamMap) => {
            const quizId = paramMap.get('quizId');
            console.log('activated route works too');
            this.setupForm();

            if (quizId) {
                console.log('quizId exists');

                this.quizHttpService.getQuizById(quizId).subscribe((quiz: Quiz) => {
                    console.log('the sub is working correctly');
                    if (quiz) {
                        this.quiz = quiz;
                        this.questionsContainer = this.quiz.questions;
                        this.setupForm(this.quiz);
                    }
                });
            }

            this.questionInteractionService.registerOnAddQuestion(() => {
                this.openQuestionDialog();
            });

            this.questionInteractionService.registerOnShareQuestion((question: Question) => {
                this.questionSharingService.share(question);
            });

            this.questionInteractionService.registerOnDeleteQuestion((question: Question) => {
                this.deleteQuestion(question);
            });

            this.questionInteractionService.registerOnEditQuestion((question: Question) => {
                this.openQuestionDialog('Modifier une question', question);
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

    openQuestionDialog(
        title:string = 'Créer une Question', 
        question: Question = 
                                {
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
                                } 
        ) {
        const dialogRef = this.dialogService.open(UpsertQuestionDialogComponent, {
            data: {
                title: title,
                question: question,
            },
        });
        dialogRef.afterClosed().subscribe({
            next: (data: Question) => {
                if (data) {
                    if (question._id != '') {
                        question.text = data.text;
                        question.choices = data.choices;
                        question.points = data.points;
                        question.lastModification = data.lastModification;
                    }
                    else {
                        this.questionsContainer.push(data);
                    }
                }
            },
        });
    }

    generateRandomString(length: number = ID_LENGTH): string {
        const lettersAndDigits = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';

        for (let i = 0; i < length; i++) {
            const randomIndex: number = Math.floor(Math.random() * lettersAndDigits.length);
            randomString += lettersAndDigits.charAt(randomIndex);
        }

        return randomString;
    }

    submitQuiz() {
        console.log('submit Quiz is entered');
        if (this.questionsContainer.length !== 0 && this.formGroup.valid) {
            console.log('enough questions and title $ description is');
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
                console.log('hi');
                this.quizHttpService.updateQuiz(quiz).subscribe({
                    next: (x: Quiz) => {
                        this.quiz = x;
                        this.snackBar.open('Le quiz a été enregistré avec succès', '', { duration: SNACK_MESSAGE_DURATION });
                    },
                    error: (e) => {
                        this.snackBar.open("Le quiz n'a pas pu être modifié", '', { duration: SNACK_MESSAGE_DURATION });
                        window.console.log("L'erreur est : ", e);
                    },
                });
            } else {
                this.quizHttpService.createQuiz(quiz).subscribe({
                    next: (x: Quiz) => {
                        this.quiz = x;
                        this.snackBar.open('Le quiz a été enregistré avec succès', '', { duration: SNACK_MESSAGE_DURATION });
                    },
                    error: (e) => {
                        this.snackBar.open("Le quiz n'a pas pu être créer", '', { duration: SNACK_MESSAGE_DURATION });
                        window.console.log("L'erreur est : ", e);
                    },
                });
            }
        } else {
            this.snackBar.open("L'un des paramètres est erroné, veuillez réessayer", '', { duration: SNACK_MESSAGE_DURATION });
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
