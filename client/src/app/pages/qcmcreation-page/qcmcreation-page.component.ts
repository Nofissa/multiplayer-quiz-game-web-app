import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UpsertQuestionDialogComponent } from '@app/components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { Answer } from '@app/interfaces/answer';
import { Question } from '@app/interfaces/question';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
// import { Quiz } from '@app/interfaces/quiz';

@Component({
    selector: 'app-qcmcreation-page',
    templateUrl: './qcmcreation-page.component.html',
    styleUrls: ['./qcmcreation-page.component.scss'],
})
export class QCMCreationPageComponent implements OnInit {
    title = 'hi';
    formGroup: FormGroup;
    questionsArray: FormArray;

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
        answerTime: 10,
        pointValue: 10,
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
        return this.formGroup.get('questions') as FormArray;
    }

    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            title: ['', Validators.required],
            descritpion: ['', Validators.required],
            questions: this.formBuilder.array([]),
        });
    }

    addQuestion() {
        this.dialog.open(UpsertQuestionDialogComponent, {
            data: this.emptyDialogData,
        });
    }

    submitQuiz() {
        window.console.log('Form submitted:', this.formGroup.value);
        // send info to where it needs to go
    }
}
