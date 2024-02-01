import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { Answer } from '@app/interfaces/answer';
import { Question } from '@app/interfaces/question';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { QuestionInteractionService } from '@app/services/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing.service';
// import { Quiz } from '@app/interfaces/quiz';

@Component({
    selector: 'app-qcmcreation-page',
    templateUrl: './qcmcreation-page.component.html',
    styleUrls: ['./qcmcreation-page.component.scss'],
    providers: [QuestionInteractionService],
})
export class QCMCreationPageComponent implements OnInit {
    title = 'hi';
    formGroup: FormGroup;
    questionsArray: FormArray;
    questionsContainer: Question[] = [];

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
    ) {}

    get questions(): FormArray {
        return this.formGroup.get('questions') as FormArray;
    }

    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            title: ['', Validators.required],
            descritpion: ['', Validators.required],
            questions: this.formBuilder.array(this.questionsContainer),
        });

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
            } // ajoute la question dans le formArray et la vue
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
        window.console.log('Form submitted:', this.formGroup.value);
        // send info to where it needs to go
    }
}
