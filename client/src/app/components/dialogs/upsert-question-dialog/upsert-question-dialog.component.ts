import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Answer } from '@app/interfaces/answer';
import { Question } from '@app/interfaces/question';
import { UpsertQuestionDialogData } from '@app/interfaces/upsert-question-dialog-data';

const POINT_VALUE_BASE_MULTIPLE = 10;
const MAX_CHOICE_COUNT = 4;
const MIN_TIME = 10;
const MAX_TIME = 60;

@Component({
    selector: 'app-upsert-question-dialog',
    templateUrl: './upsert-question-dialog.component.html',
    styleUrls: ['./upsert-question-dialog.component.scss'],
})
export class UpsertQuestionDialogComponent {
    maxChoiceCount = MAX_CHOICE_COUNT;
    formGroup: FormGroup;
    answersArray: FormArray;
    private minTime: number = MIN_TIME;
    private maxTime: number = MAX_TIME;

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<UpsertQuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UpsertQuestionDialogData,
    ) {
        this.answersArray = this.formBuilder.array(
            this.data.question.answers.map((answer) => {
                return this.formBuilder.group({
                    answer: [answer.answer, Validators.required],
                    isCorrect: [answer.isCorrect, Validators.required],
                });
            }),
            [Validators.required, this.oneFalseValidator(), this.oneTrueValidator()],
        ) as FormArray<FormGroup>;

        this.formGroup = this.formBuilder.group({
            question: [this.data.question.question, Validators.required],
            answers: this.answersArray,
            timeInSeconds: [this.data.question.timeInSeconds, [Validators.required, this.timeValidator()]],
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        if (this.formGroup.valid) {
            const question: Question = this.formGroup.value;
            this.dialogRef.close(question);
        } else {
            window.alert("l'un des paramètres est erroné, veuillez réessayer");
        }
    }

    private oneTrueValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const answerArray: Answer[] = control.value;
            for (const answer of answerArray) {
                if (answer.isCorrect) {
                    return null;
                }
            }
            return { noTrueAnswer: true };
        };
    }

    private oneFalseValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const answerArray: Answer[] = control.value;
            for (const answer of answerArray) {
                if (!answer.isCorrect) {
                    return null;
                }
            }
            return { noFalseAnswer: true };
        };
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
