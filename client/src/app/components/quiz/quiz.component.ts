import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Quiz } from '@common/quiz';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
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
    delete = new EventEmitter<Quiz>();

    constructor(
        private readonly dialog: MatDialog,
        private readonly quizHttpService: QuizHttpService,
        private readonly router: Router,
    ) {}

    openDeleteQuizDialog() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '30%',
            data: {
                title: 'Supprimer le quiz',
                prompt: 'Êtes vous certains de vouloir supprimer le quiz?',
            },
        });

        dialogRef.afterClosed().subscribe((isSubmited: boolean) => {
            if (isSubmited) {
                this.deleteQuiz();
            }
        });
    }

    deleteQuiz() {
        this.delete.emit(this.quiz);
    }

    editQuiz() {
        // for mongodb id
        // eslint-disable-next-line no-underscore-dangle
        this.router.navigate(['/qcm-creation'], { queryParams: { quizId: this.quiz._id } });
    }

    exportQuiz() {
        // is used in the html
        // eslint-disable-next-line no-unused-vars
        const { isHidden, ...quizCopy } = this.quiz;
        const blob = new Blob([JSON.stringify(quizCopy)], { type: 'text/json;charset=utf-8' });
        saveAs(blob, `${this.quiz.title}.json`);
    }

    onToggleChange() {
        // for mongodb id
        // eslint-disable-next-line no-underscore-dangle
        this.quizHttpService.hideQuizById(this.quiz._id).subscribe((quiz) => {
            this.quiz = quiz;
        });
    }
}
