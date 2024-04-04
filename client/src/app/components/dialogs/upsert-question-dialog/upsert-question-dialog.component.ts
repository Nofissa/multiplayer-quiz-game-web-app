import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAX_CHOICE_COUNT, MIN_CHOICE_COUNT, POINT_VALUE_BASE_MULTIPLE, SNACK_MESSAGE_DURATION } from '@app/constants';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';
import { Choice } from '@common/choice';
import { Question } from '@common/question';

const ID_LENGTH = 10;

@Component({
    selector: 'app-upsert-question-dialog',
    templateUrl: './upsert-question-dialog.component.html',
    styleUrls: ['./upsert-question-dialog.component.scss'],
})
export class UpsertQuestionDialogComponent {
    maxChoiceCount = MAX_CHOICE_COUNT;
    formBuilder: FormBuilder = new FormBuilder();
    formGroup: FormGroup;
    choicesArray: FormArray;
    toggle: boolean;

    constructor(
        @Inject(MAT_DIALOG_DATA) readonly data: UpsertQuestionDialogData,
        private readonly snackBar: MatSnackBar,
        private readonly dialogRef: MatDialogRef<UpsertQuestionDialogComponent>,
    ) {
        const choices = this.data.question.choices ?? [];
        this.choicesArray = this.formBuilder.array(
            choices.map((answer) => {
                return this.formBuilder.group({
                    text: [answer.text, Validators.required],
                    isCorrect: [answer.isCorrect, Validators.required],
                });
            }),
            [Validators.required, this.oneFalseValidator(), this.oneTrueValidator()],
        ) as FormArray<FormGroup>;

        this.toggle = this.data.question.type === 'QCM' ? false : true;

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

    get qcmToggled() {
        return this.toggle;
    }

    // needs to be able to work with different types of data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drop(event: CdkDragDrop<any[]>): void {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
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

    addAnswer() {
        if (this.choicesArray.length < MAX_CHOICE_COUNT) {
            this.choicesArray.push(
                this.formBuilder.group({
                    text: ['', Validators.required],
                    isCorrect: [false],
                }),
            );
        }
    }

    doToggle() {
        this.toggle = !this.toggle;
    }

    removeAnswerAt(index: number) {
        if (this.choicesArray.length > MIN_CHOICE_COUNT) {
            this.choicesArray.removeAt(index);
        }
    }

    cancel() {
        this.dialogRef.close();
    }

    validateChoices() {
        if (this.toggle) {
            return true;
        }
        return this.formGroup.controls.choices.valid;
    }

    submit() {
        if (this.formGroup.controls.text.valid && this.formGroup.controls.points.valid && this.validateChoices()) {
            const question: Question = {
                type: this.toggle ? 'QRL' : 'QCM',
                text: this.formGroup.value.text,
                points: this.formGroup.value.points,
                choices: this.toggle ? undefined : this.formGroup.value.choices,
                lastModification: new Date(),
                // for mongodb id
                // eslint-disable-next-line no-underscore-dangle
                _id: this.data.question._id ? this.data.question._id : this.generateRandomString(),
            };
            this.dialogRef.close(question);
            return;
        }

        let snackString = 'Une erreur est présente dans les champs :';

        if (!this.formGroup.controls.text.valid) {
            snackString += ' question,';
        }
        if (!this.formGroup.controls.choices.valid) {
            snackString += ' réponses,';
        }
        if (!this.formGroup.controls.points.valid) {
            snackString += ' points,';
        }

        this.snackBar.open(snackString + ' veuillez réessayer', '', { duration: SNACK_MESSAGE_DURATION });
    }

    private oneTrueValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.toggle) return null;
            const answerArray: Choice[] = control.value;
            const hasTrueAnswer = answerArray.some((answer) => answer.isCorrect);
            return hasTrueAnswer ? null : { noTrueAnswer: true };
        };
    }

    private oneFalseValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.toggle) return null;
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
