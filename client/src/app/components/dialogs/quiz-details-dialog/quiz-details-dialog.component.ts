import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Quiz } from '@app/interfaces/quiz';

@Component({
    selector: 'app-quiz-details-dialog',
    templateUrl: './quiz-details-dialog.component.html',
    styleUrls: ['./quiz-details-dialog.component.scss'],
})
export class QuizDetailsDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) readonly data: Quiz,
        private readonly dialogRef: MatDialogRef<QuizDetailsDialogComponent>,
        private readonly router: Router,
    ) {}

    startGame() {
        this.dialogRef.close();
        // eslint-disable-next-line no-underscore-dangle
        this.router.navigate(['/waiting-room'], { queryParams: { quizId: this.data._id } });
    }

    testGame() {
        this.dialogRef.close();
        // eslint-disable-next-line no-underscore-dangle
        this.router.navigate(['/game'], { queryParams: { quizId: this.data._id, isTest: true } });
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
