import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';

const MAX_CHOICE_COUNT = 4;
const POINT_VALUE_BASE_MULTIPLE = 10;

@Component({
    selector: 'app-upsert-question-dialog',
    templateUrl: './upsert-question-dialog.component.html',
    styleUrls: ['./upsert-question-dialog.component.scss'],
})
export class UpsertQuestionDialogComponent {
    maxChoiceCount = MAX_CHOICE_COUNT;
    formGroup: FormGroup;
    choicesArray: FormArray;

    // eslint-disable-next-line max-params
    constructor(
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<UpsertQuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UpsertQuestionDialogData,
    ) {
        this.choicesArray = this.formBuilder.array(
            this.data.question.choices.map((answer) => {
                return this.formBuilder.group({
                    text: [answer.text, Validators.required],
                    isCorrect: [answer.isCorrect, Validators.required],
                });
            }),
            [Validators.required, this.oneFalseValidator(), this.oneTrueValidator()],
        ) as FormArray<FormGroup>;

        this.formGroup = this.formBuilder.group({
            text: [this.data.question.text, Validators.required],
            choices: this.choicesArray,
            points: [this.data.question.points, [Validators.required, this.multipleOfTenValidator()]],
        });
    }

    get choicesControls() {
        return this.choicesArray.controls;
    }

    get choices() {
        return this.formGroup.controls['choices'] as FormArray<FormGroup>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drop(event: CdkDragDrop<any[]>): void {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    addAnswer() {
        if (this.choicesArray.length < 4) {
            this.choicesArray.push(
                this.formBuilder.group({
                    text: ['', Validators.required],
                    isCorrect: [false],
                }),
            );
        }
    }

    removeAnswerAt(index: number) {
        if (this.choicesArray.length > 2) {
            this.choicesArray.removeAt(index);
        }
    }

    cancel() {
        this.dialogRef.close();
    }

    submit() {
        if (this.formGroup.valid) {
            const question: Question = {
                type: 'QCM',
                text: this.formGroup.value.text,
                points: this.formGroup.value.points,
                choices: this.formGroup.value.choices,
                lastModification: new Date(),
                _id: '',
            };

            this.dialogRef.close(question);
        } else {

            let snackString: string = 'Une erreur est présente dans les champs :';
            if (!this.formGroup.controls.text.valid) {
                snackString += ' question,';
            } 
            if (!this.formGroup.controls.choices.valid) {
                snackString += ' réponses,';
            } 
            if (!this.formGroup.controls.points.valid) {
                snackString += ' points,';
            }
            this.snackBar.open(snackString + ' veuillez réessayer', '', { duration: 2000 });
        }
    }

    private oneTrueValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const answerArray: Choice[] = control.value;
            const hasTrueAnswer = answerArray.some((answer) => answer.isCorrect);
            return hasTrueAnswer ? null : { noTrueAnswer: true };
        };
    }

    private oneFalseValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const answerArray: Choice[] = control.value;
            const hasFalseAnswer = answerArray.some((answer) => !answer.isCorrect);
            return hasFalseAnswer ? null : { noFalseAnswer: true };
        };
    }

    

    private multipleOfTenValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            return value % POINT_VALUE_BASE_MULTIPLE === 0 ? null : { notMultipleOfTen: true };
        };
    }
}
