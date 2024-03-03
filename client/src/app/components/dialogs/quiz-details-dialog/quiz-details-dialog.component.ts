/* eslint-disable no-underscore-dangle */
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';

@Component({
    selector: 'app-quiz-details-dialog',
    templateUrl: './quiz-details-dialog.component.html',
    styleUrls: ['./quiz-details-dialog.component.scss'],
})
export class QuizDetailsDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        readonly data: { quiz: Quiz; onCreateGame: (quiz: Quiz) => void; onTestGame: (quiz: Quiz) => void; onNotFound: () => void },
        private readonly dialogRef: MatDialogRef<QuizDetailsDialogComponent>,
        private readonly quizHttpService: QuizHttpService,
    ) {}

    startGame() {
        this.quizHttpService.getVisibleQuizById(this.data.quiz._id).subscribe({
            next: (quiz: Quiz) => {
                this.data.onCreateGame(quiz);
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.data.onNotFound();
                }
            },
        });
    }

    testGame() {
        this.quizHttpService.getVisibleQuizById(this.data.quiz._id).subscribe({
            next: (quiz: Quiz) => {
                this.data.onTestGame(quiz);
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotFound) {
                    this.data.onNotFound();
                }
            },
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
