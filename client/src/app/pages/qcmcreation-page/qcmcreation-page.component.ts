import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { Answer } from '@app/interfaces/answer';
import { Question } from '@app/interfaces/question';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';

@Component({
    selector: 'app-qcmcreation-page',
    templateUrl: './qcmcreation-page.component.html',
    styleUrls: ['./qcmcreation-page.component.scss'],
})
export class QCMCreationPageComponent implements OnInit {
    title = 'hi';
    quizForm: FormGroup;
    emptyAnswer1: Answer = {
        answer: '',
        isCorrect: false,
    };
    emptyAnswer2: Answer = {
        answer: '',
        isCorrect: false,
    };
    emptyQuestion: Question = {
        question: '',
        answers: [],
        lastModified: new Date(),
        _id: '',
        answerTime: 10,
        pointValue: 0,
    };
    emptyDialogData: UpsertQuestionDialogData = {
        title: 'Créer une Question',
        question: this.emptyQuestion,
    };

    constructor(
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
    ) {}

    get questions(): FormArray {
        return this.quizForm.get('answers') as FormArray;
    }

    ngOnInit() {
        this.quizForm = this.formBuilder.group({
            quizTitle: ['', Validators.required],
            quizDescritpion: ['', Validators.required],
            questions: this.formBuilder.array([]),
            answerTime: [10, Validators.required],
        });
    }

    addQuestion() {
        this.dialog.open(UpsertQuestionDialogComponent, {
            data: this.emptyDialogData,
        });
    }

    submitQuiz() {
        window.console.log('Form submitted:', this.quizForm.value);
        // send info to where it needs to go
    }
}
