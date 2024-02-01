import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHttpService } from '@app/services/quiz-http.service';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent {
    @Input()
    quiz: Quiz;

    @Output()
    refresh = new EventEmitter<void>();

    isDeleted: boolean = false;

    constructor(
        private readonly quizHttpService: QuizHttpService,
        private readonly router: Router,
    ) {}

    deleteQuiz() {
        // eslint-disable-next-line no-underscore-dangle
        this.quizHttpService.deleteQuizById(this.quiz._id).subscribe((quiz: Quiz) => {
            if (quiz) {
                this.isDeleted = true;
            }
        });
    }

    editQuiz() {
        // eslint-disable-next-line no-underscore-dangle
        this.router.navigate([`/qcm-creation?quizId=${this.quiz._id}`]);
    }

    exportQuiz() {
        const blob = new Blob([JSON.stringify(this.quiz)], { type: 'text/json;charset=utf-8' });
        saveAs(blob, `${this.quiz.titre}.json`);
    }

    onToggleChange() {
        this.quiz.isHidden = !this.quiz.isHidden;
        this.quizHttpService.updateQuiz(this.quiz).subscribe((quiz) => {
            this.quiz = quiz;
        });
    }
}
