import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { Answer } from '@app/interfaces/answer';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { QuestionInteractionService } from '@app/services/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing.service';
import { QuizHttpService } from '@app/services/quiz-http.service';
// import { Quiz } from '@app/interfaces/quiz';

@Component({
    selector: 'app-qcmcreation-page',
    templateUrl: './qcmcreation-page.component.html',
    styleUrls: ['./qcmcreation-page.component.scss'],
    providers: [QuestionInteractionService, QuizHttpService],
})
export class QCMCreationPageComponent implements OnInit {
    title = 'hi';
    formGroup: FormGroup;
    questionsContainer: Question[] = [];
    quizId: string;
    quiz: Quiz;

    emptyAnswer1: Answer = {
        answer: '',
        isCorrect: false,
    };
    emptyAnswer2: Answer = {
        answer: '',
        isCorrect: true,
    };
    emptyQuestion: Question = {
        question: '',
        answers: [this.emptyAnswer1, this.emptyAnswer2],
        lastModified: new Date(),
        _id: '',
        timeInSeconds: 10,
        pointValue: 10,
    };
    emptyDialogData: UpsertQuestionDialogData = {
        title: 'Créer une Question',
        question: this.emptyQuestion,
    };

    constructor(
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        public questionInteractionService: QuestionInteractionService,
        private questionSharingService: QuestionSharingService,
        private quizHttpServices: QuizHttpService,
        private route: ActivatedRoute,
    ) {}

    get questions(): FormArray {
        return this.formGroup.get('questions') as FormArray;
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.quizId = params['id'];
        });

        this.quizHttpServices.getQuizById(this.quizId).subscribe({
            next: (x: Quiz) => {
                this.quiz = x;
            },
            error: () => {
                return;
            },
        });

        if (this.quiz) {
            this.formGroup = this.formBuilder.group({
                title: [this.quiz.title, Validators.required],
                descritpion: [this.quiz.description, Validators.required],
            });

            this.questionsContainer = this.quiz.questions;
        } else {
            this.formGroup = this.formBuilder.group({
                title: ['', Validators.required],
                descritpion: ['', Validators.required],
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
            const dialogRef = this.dialog.open(UpsertQuestionDialogComponent, {
                data: { title: 'Moddifier une question', question },
            });
            dialogRef.afterClosed().subscribe({
                next: (data: Question) => {
                    if (data) {
                        question.question = data.question;
                        question.answers = data.answers;
                        question.timeInSeconds = data.timeInSeconds;
                        question.pointValue = data.pointValue;
                        question.lastModified = data.lastModified;
                    }
                },
            });
        });

        this.questionSharingService.subscribe((question: Question) => {
            if (!this.questionsContainer.find((x) => x._id === question._id)) {
                this.questionsContainer.push(question);
            }
        });
    }

    deleteQuestion(question: Question) {
        if (question) {
            this.questionsContainer = this.questionsContainer.filter((x) => x.question !== question.question);
        }
    }

    addQuestion() {
        const dialogRef = this.dialog.open(UpsertQuestionDialogComponent, {
            data: this.emptyDialogData,
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
        // validations de nom unique dans le back end
        if (this.questionsContainer.length !== 0) {
            const quiz: Quiz = {
                _id: this.quizId,
                title: this.formGroup.value.title,
                description: this.formGroup.value.description,
                questions: this.questionsContainer,
                lastModified: new Date(),
                isHidden: true,
            };

            try {
                if (this.quiz) {
                    this.quizHttpServices.updateQuiz(quiz).subscribe({
                        next: (x: Quiz) => {
                            this.quiz = x;
                            window.alert('Le quiz est enregistré avec succès');
                        },
                        error: (e) => {
                            window.console.log('une erreur est survenue', e);
                            window.alert('La création du Quiz na pas pu être faite');
                        },
                    });
                } else {
                    this.quizHttpServices.createQuiz(quiz).subscribe({
                        next: (x: Quiz) => {
                            this.quiz = x;
                            window.alert('Le quiz est enregistré avec succès');
                        },
                        error: (e) => {
                            window.console.log('une erreur est survenue', e);
                            window.alert('La création du Quiz na pas pu être faite');
                        },
                    });
                }
            } catch (e) {
                window.alert('Un problème est survenu');
                window.console.log('Server Error:', e);
            }
        } else {
            window.alert('Un paramètre du Quiz est erroné, veuillez y remédier');
        }

        // send info to where it needs to go
    }
}
