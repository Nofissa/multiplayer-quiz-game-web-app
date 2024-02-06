import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { KeyBindingService } from '@app/services/key-binding.service';
import { QuizHttpService } from '@app/services/quiz-http.service';
import { TimerService } from '@app/services/timer-service';

const QUESTIONS_NOT_READY_INDEX = -1;
const ONE_SECOND_IN_MS = 1000;

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    // animation from ChatGPT
    animations: [trigger('scale', [transition(':enter', [style({ transform: 'scale(0)' }), animate('1s', style({ transform: 'scale(1)' }))])])],
})
export class GamePageComponent implements OnInit, OnDestroy {
    secondsLeft: number;
    timerDuration: number;
    selectedChoices: Choice[] = [];
    questions: Question[];
    currentQuestionIndex: number = QUESTIONS_NOT_READY_INDEX;
    score: number = 0;
    feedbackMessage: string;
    feedbackMessageClass: string = 'feedback-message';

    constructor(
        private readonly keyBindingService: KeyBindingService,
        private readonly timerService: TimerService,
        private readonly quizHttpService: QuizHttpService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
    ) {}

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        const focusedElement = document.activeElement as HTMLElement;

        if (focusedElement.tagName.toLowerCase() === 'textarea') {
            return;
        }

        const executor = this.keyBindingService.getExecutor(event.key);

        if (executor) {
            event.preventDefault();
            executor();
        }
    }

    ngOnInit() {
        this.setupKeyBindings();
        this.loadQuiz();
    }

    ngOnDestroy() {
        this.timerService.stopTimer();
    }

    setupKeyBindings() {
        ['1', '2', '3', '4'].forEach((x) => {
            this.keyBindingService.registerKeyBinding(x, () => {
                const choiceIndex = parseInt(x, 10) - 1;

                this.toggleChoiceSelection(this.questions[this.currentQuestionIndex].choices[choiceIndex]);
            });
        });

        this.keyBindingService.registerKeyBinding('Enter', () => {
            this.validateChoices();
        });
    }

    loadQuiz() {
        const quizId = this.activatedRoute.snapshot.queryParams['quizId'];

        this.quizHttpService.getQuizById(quizId).subscribe((quiz: Quiz) => {
            this.questions = quiz.questions;
            this.timerDuration = 200;
            this.currentQuestionIndex = 0;
            this.startTimer();
        });
    }

    startTimer() {
        this.timerService.startTimer(this.timerDuration, (secondsLeft: number) => {
            this.secondsLeft = secondsLeft;

            if (this.secondsLeft === 0) {
                this.validateChoices();

                setTimeout(() => {
                    this.feedbackMessage = '';
                    this.nextQuestion();
                }, ONE_SECOND_IN_MS);
            }
        });
    }

    isSelected(choice: Choice): boolean {
        return this.selectedChoices.some((x): boolean => x === choice);
    }

    toggleChoiceSelection(choice: Choice) {
        if (this.isSelected(choice)) {
            this.selectedChoices = this.selectedChoices.filter((x) => x !== choice);
            return;
        }

        this.selectedChoices.push(choice);
    }

    validateChoices() {
        if (this.areChoicesCorrect()) {
            this.score += this.questions[this.currentQuestionIndex].points;
            this.feedbackMessage = 'Bonne réponse! :)';
            this.feedbackMessageClass = 'correct-answer';
        } else {
            this.feedbackMessage = 'Mauvaise réponse :(';
            this.feedbackMessageClass = 'incorrect-answer';
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.selectedChoices = [];
            this.startTimer();

            return;
        }

        // this.router.navigateByUrl('/home');
    }

    areChoicesCorrect(): boolean {
        const allCorrect = this.selectedChoices.every((x) => x.isCorrect);

        return this.selectedChoices.length !== 0 && allCorrect;
    }

    openConfirmationDialog() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: { prompt: 'Voulez-vous vraiment quitter la partie?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.router.navigateByUrl('/home');
            }
        });
    }
}
