import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';

const POINT_VALUE_BASE_MULTIPLE = 10;
const MAX_CHOICE_COUNT = 4;

@Component({
    selector: 'app-upsert-question-dialog',
    templateUrl: './upsert-question-dialog.component.html',
    styleUrls: ['./upsert-question-dialog.component.scss'],
})
export class UpsertQuestionDialogComponent {
    maxChoiceCount = MAX_CHOICE_COUNT;
    formGroup: FormGroup;
    answersArray: FormArray;
    private minTime: number = 10;
    private maxTime: number = 60;

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<UpsertQuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UpsertQuestionDialogData,
    ) {
        this.answersArray = this.formBuilder.array(
            this.data.question.answers.map((answer) => {
                return this.formBuilder.group({
                    answer: [answer.answer, Validators.required],
                    isCorrect: [answer.isCorrect],
                });
            }),
            Validators.required,
        ) as FormArray<FormGroup>;

        this.formGroup = this.formBuilder.group({
            question: [this.data.question.question, Validators.required],
            answers: this.answersArray,
            answerTime: [this.data.question.answerTime, [Validators.required, this.timeValidator()]],
            pointValue: [this.data.question.pointValue, [Validators.required, this.multipleOfTenValidator()]],
        });
    }

    get answersControls() {
        return this.answersArray.controls;
    }

    get answers() {
        return this.formGroup.controls['answers'] as FormArray<FormGroup>;
    }

    get getMaxTime() {
        return this.maxTime;
    }

    get getMinTime() {
        return this.minTime;
    }

    drop(event: CdkDragDrop<any[]>): void {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    addAnswer() {
        this.answersArray.push(
            this.formBuilder.group({
                answer: ['', Validators.required],
                isCorrect: [false],
            }),
        );
    }

    removeAnswerAt(index: number) {
        this.answersArray.removeAt(index);
    }

    cancel() {
        this.dialogRef.close();
    }

    submit() {
        console.log(this.formGroup);
        if (this.formGroup.valid) {
            this.dialogRef.close(this.formGroup.value);
        } else {
            window.alert("l'un des paramètres est erroné");
        }
    }

    private multipleOfTenValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            return value % POINT_VALUE_BASE_MULTIPLE === 0 ? null : { notMultipleOfTen: true };
        };
    }

    private timeValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            return value >= this.minTime && value <= this.maxTime ? null : { notValidTime: true };
        };
    }
}
