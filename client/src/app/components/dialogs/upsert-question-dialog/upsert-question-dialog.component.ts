import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';

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

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<UpsertQuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UpsertQuestionDialogData,
    ) {
        this.answersArray = this.formBuilder.array(
            this.data.question.choices.map((choice) => this.formBuilder.control(choice.text, Validators.required)),
            Validators.required,
        ) as FormArray;
    }

    get answersControls(): FormControl[] {
        return this.answersArray.controls as FormControl[];
    }

    getChoiceCount(): number {
        return this.answersControls.length;
    }

    addAnswer() {
        this.answersArray.push(this.formBuilder.control('', Validators.required));
    }

    removeAnswerAt(index: number) {
        this.answersArray.removeAt(index);
    }

    cancel() {
        this.dialogRef.close();
    }

    submit() {
        if (this.formGroup.valid) {
            this.dialogRef.close(this.formGroup.value);
        }
    }
}
