import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromptDialogComponent } from '@app/components/dialogs/prompt-dialog/prompt-dialog.component';
import { NOTICE_DURATION_MS } from '@app/constants/constants';
import { Quiz } from '@common/quiz';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-quiz-list',
    templateUrl: './quiz-list.component.html',
    styleUrls: ['./quiz-list.component.scss'],
})
export class QuizListComponent implements OnInit {
    quizzes: Quiz[] = [];

    constructor(
        private readonly dialog: MatDialog,
        private readonly quizHttpService: QuizHttpService,
        private snackbar: MatSnackBar,
    ) {}

    ngOnInit() {
        this.observeFetchQuizzes().subscribe((quizzes: Quiz[]) => {
            this.quizzes = quizzes;
        });
    }

    importQuiz(event: Event) {
        this.observeFetchQuizzes().subscribe((quizzes: Quiz[]) => {
            this.quizzes = quizzes;
            const file = (event.target as HTMLInputElement)?.files?.[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = (progessEvent) => {
                    this.readFile(progessEvent);
                };
                reader.readAsText(file);
            }
        });
    }

    readFile(progressEvent: ProgressEvent<FileReader>) {
        const quiz = this.parseQuiz(progressEvent);

        if (!quiz) {
            return;
        }

        if (this.quizzes.some((q) => q.title === quiz.title)) {
            this.openPromptDialog(quiz);
        } else {
            this.handleImportSubscription(quiz);
        }
    }

    openPromptDialog(quiz: Quiz) {
        const dialogRef = this.dialog.open(PromptDialogComponent, {
            width: '30%',
            data: {
                title: 'Nom de quiz existant',
                message: 'Veuillez entrer un autre nom pour le quiz',
                placeholder: 'Nom du quiz',
                value: '',
                submitText: 'Corriger',
                cancelText: 'Annuler',
                hideAnswer: false,
            },
        });
        dialogRef.afterClosed().subscribe((data) => {
            quiz.title = data.value;

            if (this.quizzes.some((q) => q.title === quiz.title)) {
                this.handleSnackbarError('Nom de quiz déjà existant');
            } else {
                this.handleImportSubscription(quiz);
            }
        });
    }

    deleteQuiz(quiz: Quiz) {
        // for mongodb id
        // eslint-disable-next-line no-underscore-dangle
        this.quizHttpService.deleteQuizById(quiz._id).subscribe(() => {
            // for mongodb id
            // eslint-disable-next-line no-underscore-dangle
            this.quizzes = this.quizzes.filter((x) => x._id !== quiz._id);
        });
    }

    handleImportSubscription(quiz: Quiz) {
        this.quizHttpService.createQuiz(quiz).subscribe({
            next: (createdQuiz: Quiz) => {
                this.quizzes.push(createdQuiz);
            },
            error: (error: HttpErrorResponse) => {
                if (error.error.message.length) {
                    this.handleSnackbarError(error.error.message);
                } else {
                    this.handleSnackbarError('Erreur lors de la création du quiz');
                }
            },
        });
    }

    private parseQuiz(e: ProgressEvent<FileReader>): Quiz | null {
        try {
            return JSON.parse(e.target?.result as string);
        } catch (error) {
            this.handleSnackbarError('Erreur lors de la lecture du fichier');
            return null;
        }
    }

    private handleSnackbarError(error: string) {
        this.snackbar.open(error, 'Fermer', {
            duration: NOTICE_DURATION_MS,
            verticalPosition: 'top',
        });
    }

    private observeFetchQuizzes(): Observable<Quiz[]> {
        return this.quizHttpService.getAllQuizzes();
    }
}
