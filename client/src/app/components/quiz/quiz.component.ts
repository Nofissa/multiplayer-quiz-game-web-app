import { Component, EventEmitter, Input, Output } from '@angular/core';
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

    constructor(private readonly quizHttpService: QuizHttpService) {}

    deleteQuiz(quiz: Quiz) {
        this.quizHttpService.deleteQuizById(quiz._id).subscribe(() => {
            this.refresh.emit();
        });
        console.log('deleteQuiz' + quiz._id + ' ' + quiz.titre);
    }
    editQuiz(quiz: Quiz) {
        this.quizHttpService.updateQuiz(quiz).subscribe(() => {
            this.refresh.emit();
        });
        console.log('editQuiz' + quiz._id + ' ' + quiz.titre);
    }

    exportQuiz(quiz: Quiz) {
        const blob = new Blob([JSON.stringify(quiz)], { type: 'text/json;charset=utf-8' });
        saveAs(blob, `${quiz.titre}.json`);
    }

    onToggleChange(quiz: Quiz) {
        this.quizHttpService.updateQuiz(quiz).subscribe(() => {
            this.refresh.emit();
        });
        console.log('onToggleChange' + quiz._id + ' ' + quiz.titre);
    }
}
