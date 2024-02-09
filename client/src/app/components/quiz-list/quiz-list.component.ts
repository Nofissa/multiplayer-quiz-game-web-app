import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromptDialogComponent } from '@app/components/dialogs/prompt-dialog/prompt-dialog.component';
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
        private readonly dialog: MatDialog,
        private readonly quizHttpService: QuizHttpService,
        private snackbar: MatSnackBar,
    ) {}

    ngOnInit() {
        this.fetchQuizzes();
    }

    importQuiz(event: Event) {
        this.fetchQuizzes();
        const file = (event.target as HTMLInputElement)?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const quiz = this.tryParse(e);
                if (!quiz) {
                    return;
                }
                if (this.isQuizNameTaken(quiz)) {
                    this.openPromptDialog(quiz);
                } else {
                    this.handleImportSubscription(quiz);
                }
            };
            reader.readAsText(file);
        }
    }

    private openPromptDialog(quiz: Quiz) {
        const dialogRef = this.dialog.open(PromptDialogComponent, {
            width: '30%',
            data: {
                title: 'Nom de quiz existant',
                message: 'Veuillez entrer un autre nom pour le quiz',
                placeholder: 'Nom du quiz',
                value: '',
                submitText: 'Corriger',
                cancelText: 'Annuler',
            },
        });
        dialogRef.afterClosed().subscribe((value) => {
            quiz.title = value.value;
            if (this.isQuizNameTaken(quiz)) {
                this.handleSnackbarError('Nom de quiz déjà existant');
            } else {
                this.handleImportSubscription(quiz);
            }
        });
    }

    private handleImportSubscription(quiz: Quiz) {
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
    }

    private tryParse(e: ProgressEvent<FileReader>): Quiz | null {
        try {
            return JSON.parse(e.target?.result as string);
        } catch (error) {
            this.handleSnackbarError('Erreur lors de la lecture du fichier');
            return null;
        }
    }

    private isQuizNameTaken(quiz: Quiz): boolean {
        return this.quizzes.some((q) => q.title === quiz.title);
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
