import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';

@Component({
    selector: 'app-upsert-question-dialog',
    templateUrl: './upsert-question-dialog.component.html',
    styleUrls: ['./upsert-question-dialog.component.scss'],
})
export class UpsertQuestionDialogComponent {
    formGroup: FormGroup;
    incorrectAnswersArray: FormArray;

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<UpsertQuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UpsertQuestionDialogData,
    ) {
        this.incorrectAnswersArray = this.formBuilder.array(
            this.data.question.incorrectAnswers.map((answer) => this.formBuilder.control(answer, Validators.required)),
            Validators.required,
        ) as FormArray;

        this.formGroup = this.formBuilder.group({
            question: [this.data.question.question, Validators.required],
            incorrectAnswers: this.incorrectAnswersArray,
            correctAnswer: [this.data.question.correctAnswer, Validators.required],
        });
    }

    get incorrectAnswersControls(): FormControl[] {
        return this.incorrectAnswersArray.controls as FormControl[];
    }

    cancel(): void {
        this.dialogRef.close();
    }

    submit(): void {
        if (this.formGroup.valid) {
            this.dialogRef.close(this.formGroup.value);
        }
    }
}
