import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHttpService } from '@app/services/quiz-http.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    quiz: Quiz;
    isTest: boolean;

    constructor(
        private readonly quizHttpService: QuizHttpService,
        private readonly activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.loadQuiz();
        this.loadMode();
    }

    loadQuiz() {
        const quizId = this.activatedRoute.snapshot.queryParams['quizId'];

        this.quizHttpService.getVisibleQuizById(quizId).subscribe((quiz: Quiz) => {
            this.quiz = quiz;
        });
    }

    loadMode() {
        const isTest = this.activatedRoute.snapshot.queryParams['isTest'];

        this.isTest = isTest === 'true';
    }
}
