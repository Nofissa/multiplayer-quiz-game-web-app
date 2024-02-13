/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { QuizDetailsDialogComponent } from '@app/components/dialogs/quiz-details-dialog/quiz-details-dialog.component';
import { Quiz } from '@app/interfaces/quiz';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import SwiperCore, { EffectCoverflow, Navigation, Pagination } from 'swiper';

SwiperCore.use([Navigation, Pagination, EffectCoverflow]);

const SNACK_BAR_DURATION_MS = 3000;

@Component({
    selector: 'app-create-game-page',
    templateUrl: './create-game-page.component.html',
    styleUrls: ['./create-game-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CreateGamePageComponent implements OnInit {
    quizzArray: Quiz[];

    private readonly dialogService: MatDialog;
    private readonly snackBarService: MatSnackBar;

    constructor(
        materialServicesProvider: MaterialServicesProvider,
        private readonly router: Router,
        private readonly quizHttpService: QuizHttpService,
    ) {
        this.dialogService = materialServicesProvider.dialog;
        this.snackBarService = materialServicesProvider.snackBar;
    }

    ngOnInit() {
        this.loadQuizzes();
    }

    loadQuizzes(): void {
        this.quizHttpService.getVisibleQuizzes().subscribe({
            next: (quizzes) => {
                this.quizzArray = quizzes;
            },
        });
    }

    openQuizDetails(quiz: Quiz): void {
        const dialogRef = this.dialogService.open(QuizDetailsDialogComponent, {
            data: {
                quiz,
                onStartGame: (receivedQuiz: Quiz) => {
                    dialogRef.close();
                    this.startGame(receivedQuiz);
                },
                onTestGame: (receivedQuiz: Quiz) => {
                    dialogRef.close();
                    this.testGame(receivedQuiz);
                },
                onNotFound: () => {
                    dialogRef.close();
                    this.snackBarService.open("Le quiz n'est plus disponible", 'OK', {
                        duration: SNACK_BAR_DURATION_MS,
                        verticalPosition: 'top',
                        panelClass: ['base-snackbar'],
                    });
                    this.loadQuizzes();
                },
            },
        });
    }

    private startGame(quiz: Quiz) {
        this.router.navigate(['/game'], { queryParams: { quizId: quiz._id } });
    }

    private testGame(quiz: Quiz) {
        this.router.navigate(['/game'], { queryParams: { quizId: quiz._id, isTest: true } });
    }
}
