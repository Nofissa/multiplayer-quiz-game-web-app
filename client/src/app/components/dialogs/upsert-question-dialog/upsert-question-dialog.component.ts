import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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
    incorrectAnswersArray: FormArray;
    correctAnswersArray: FormArray;
    isCorrect: FormArray;

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<UpsertQuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UpsertQuestionDialogData,
    ) {
        this.incorrectAnswersArray = this.formBuilder.array(
            this.data.question.incorrectAnswers.map((answer) => this.formBuilder.control(answer, Validators.required)),
            Validators.required,
        ) as FormArray;
        this.correctAnswersArray = this.formBuilder.array(
            this.data.question.correctAnswers.map((answer) => this.formBuilder.control(answer, Validators.required)),
            Validators.required,
        ) as FormArray;
        this.isCorrect = this.formBuilder.array(
            this.data.question.correctAnswers.map((answer) => this.formBuilder.control(answer, Validators.required)),
            Validators.required,
        ) as FormArray;

        this.formGroup = this.formBuilder.group({
            question: [this.data.question.question, Validators.required],
            incorrectAnswers: this.incorrectAnswersArray,
            correctAnswers: this.correctAnswersArray,
            pointValue: [this.data.question.pointValue, [Validators.required, this.multipleOfTenValidator()]],
        });
    }

    get incorrectAnswersControls(): FormControl[] {
        return this.incorrectAnswersArray.controls as FormControl[];
    }

    get correctAnswersControls(): FormControl[] {
        return this.correctAnswersArray.controls as FormControl[];
    }

    drop(event: CdkDragDrop<FormControl[]>): void {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    getChoiceCount(): number {
        return this.correctAnswersControls.length + this.incorrectAnswersControls.length;
    }

    addCorrectAnswer() {
        this.correctAnswersArray.push(this.formBuilder.control('', Validators.required));
    }

    removeCorrectAnswerAt(index: number) {
        this.correctAnswersArray.removeAt(index);
    }

    addIncorrectAnswer() {
        this.incorrectAnswersArray.push(this.formBuilder.control('', Validators.required));
    }

    removeIncorrectAnswerAt(index: number) {
        this.incorrectAnswersArray.removeAt(index);
    }

    cancel() {
        this.dialogRef.close();
    }

    submit() {
        if (this.formGroup.valid) {
            this.dialogRef.close(this.formGroup.value);
        }
    }

    private multipleOfTenValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            return value % POINT_VALUE_BASE_MULTIPLE === 0 ? null : { notMultipleOfTen: true };
        };
    }
}
