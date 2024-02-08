import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHttpService } from '@app/services/quiz-http.service';

const SNACKBAR_DURATION = 5000;

@Component({
    selector: 'app-quiz-list',
    templateUrl: './quiz-list.component.html',
    styleUrls: ['./quiz-list.component.scss'],
})
export class QuizListComponent implements OnInit {
    quizzes: Quiz[] = [];

    constructor(
        private readonly quizHttpService: QuizHttpService,
        private snackbar: MatSnackBar,
    ) {}

    ngOnInit() {
        this.fetchQuizzes();
    }

    importQuiz(event: Event) {
        const file = (event.target as HTMLInputElement)?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const quiz = this.tryParse(e);
                if (!quiz) {
                    return;
                }
                this.quizHttpService.createQuiz(quiz).subscribe({
                    next: (createdQuiz: Quiz) => {
                        this.quizzes.push(createdQuiz);
                    },
                    error: (error: Error) => {
                        if (error.message.length) {
                            this.handleSnackbarError(error.message);
                        } else {
                            this.handleSnackbarError('Erreur lors de la création du quiz');
                        }
                    },
                });
            };
            reader.readAsText(file);
        }
    }

    private tryParse(e: ProgressEvent<FileReader>): Quiz | null {
        try {
            return JSON.parse(e.target?.result as string);
        } catch (error) {
            this.handleSnackbarError('Erreur lors de la lecture du fichier');
            return null;
        }
    }

    private handleSnackbarError(error: string) {
        this.snackbar.open(error, 'Fermer', {
            duration: SNACKBAR_DURATION,
            verticalPosition: 'top',
        });
    }

    private fetchQuizzes() {
        this.quizHttpService.getAllQuizzes().subscribe((quizzes: Quiz[]) => {
            this.quizzes = quizzes;
        });
    }
}
