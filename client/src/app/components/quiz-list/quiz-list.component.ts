import { Component, OnInit } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHttpService } from '@app/services/quiz-http.service';

@Component({
    selector: 'app-quiz-list',
    templateUrl: './quiz-list.component.html',
    styleUrls: ['./quiz-list.component.scss'],
})
export class QuizListComponent implements OnInit {
    quizzes: Quiz[] = [];

    constructor(private readonly quizHttpService: QuizHttpService) {}

    ngOnInit() {
        this.fetchQuizzes();
    }

    private fetchQuizzes() {
        this.quizHttpService.getAllQuizzes().subscribe((quizzes: Quiz[]) => {
            this.quizzes = quizzes;
        });
    }

    importQuiz(event: Event) {
        const file = (event.target as HTMLInputElement)?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const quiz: Quiz = JSON.parse(e.target?.result as string);
                this.quizHttpService.createQuiz(quiz).subscribe(() => {
                    this.fetchQuizzes();
                });
            };
            reader.readAsText(file);
        }
    }
}
