import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QuizDetailsDialogComponent } from '@app/components/dialogs/quiz-details-dialog/quiz-details-dialog.component';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHttpService } from '@app/services/quiz-http.service';
import SwiperCore, { EffectCoverflow, Navigation, Pagination } from 'swiper';

SwiperCore.use([Navigation, Pagination, EffectCoverflow]);

@Component({
    selector: 'app-create-game-page',
    templateUrl: './create-game-page.component.html',
    styleUrls: ['./create-game-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CreateGamePageComponent implements OnInit {
    quizzArray: Quiz[];

    constructor(
        private dialogService: MatDialog,
        private quizHttpService: QuizHttpService,
    ) {}

    ngOnInit() {
        this.loadQuizzes();
    }

    loadQuizzes(): void {
        this.quizHttpService.getAllQuizzes().subscribe({
            next: (quizzes) => {
                this.quizzArray = quizzes;
            },
        });
    }

    openQuizDetails(quiz: Quiz): void {
        this.dialogService.open(QuizDetailsDialogComponent, {
            data: quiz,
        });
    }
}
