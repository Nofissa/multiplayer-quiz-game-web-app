import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
})
export class GamePageComponent implements OnInit, OnDestroy {
    secondsLeft: number;
    timerDuration: number;
    selectedAnswerBoxes: number[] = [];
    validatedAnswerBoxes: number[] = [];
    questions: Question[];
    currentQuestionIndex: number = QUESTIONS_NOT_READY_INDEX;
    timerStarted: boolean = false;
    score: number = 0;
    feedbackMessage: string;
    feedbackMessageClass: string = 'feedback-message';
    quizID: string = '65bd135dacb6e994665ca0b7';

    constructor(
        private readonly keyBindingService: KeyBindingService,
        private readonly timerService: TimerService,
        private readonly quizHttpService: QuizHttpService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
    ) {}

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        const focusedElement = document.activeElement as HTMLElement;

        if (focusedElement.tagName.toLowerCase() === 'textarea') {
            return;
        }

        event.preventDefault();
        this.keyBindingService.execute(event.key);
    }

    ngOnInit() {
        ['1', '2', '3', '4'].forEach((x) => {
            this.keyBindingService.registerKeyBinding(x, () => {
                this.toggleAnswerBox(parseInt(x, 10));
            });
        });

        this.keyBindingService.registerKeyBinding('Enter', () => {
            this.validateChoices();
        });

        this.loadQuizQuestions();
        this.startTimer();
    }

    ngOnDestroy() {
        this.timerService.stopTimer();
    }

    loadQuizQuestions() {
        this.quizHttpService.getQuizById(this.quizID).subscribe({
            next: (quiz: Quiz) => {
                this.questions = quiz.questions;
                this.timerDuration = quiz.duration;
                this.currentQuestionIndex = 0;
            },
        });
    }

    startTimer() {
        this.timerService.startTimer(this.timerDuration, (secondsLeft: number) => {
            this.secondsLeft = secondsLeft;

            if (this.secondsLeft === 0) {
                this.timerService.stopTimer();
                this.validateChoices();

                setTimeout(() => {
                    this.feedbackMessage = '';

                    if (this.currentQuestionIndex <= this.questions.length) {
                        this.removeBoxValidationHighlight();
                        this.currentQuestionIndex++;
                        this.startTimer();
                    }
                }, ONE_SECOND_IN_MS);
            }

            this.timerStarted = true;
        });
    }

    isSelected(answerBoxNumber: number): boolean {
        return this.selectedAnswerBoxes.includes(answerBoxNumber);
    }

    toggleAnswerBox(answerBoxNumber: number) {
        if (this.isSelected(answerBoxNumber)) {
            this.selectedAnswerBoxes = this.selectedAnswerBoxes.filter((box) => box !== answerBoxNumber);
        } else {
            this.selectedAnswerBoxes.push(answerBoxNumber);
        }
    }

    validateChoices() {
        for (const box of this.selectedAnswerBoxes) {
            this.validatedAnswerBoxes.push(box);
        }

        if (this.validatedAnswerBoxes.length !== 0) {
            this.timerService.stopTimer();
        }

        if (this.areAnswersCorrect()) {
            this.addBoxValidationHighlight('right');
            this.score += this.questions[this.currentQuestionIndex].points;
            this.feedbackMessage = 'Bonne réponse! :)';
            this.feedbackMessageClass = 'correct-answer';
        } else {
            this.addBoxValidationHighlight('wrong');
            this.feedbackMessage = 'Mauvaise réponse :(';
            this.feedbackMessageClass = 'incorrect-answer';
        }

        if (this.secondsLeft !== 0) {
            setTimeout(() => {
                this.feedbackMessage = '';
                if (this.currentQuestionIndex < this.questions.length - 1) {
                    this.removeBoxValidationHighlight();
                    this.currentQuestionIndex++;
                    this.startTimer();
                }
            }, ONE_SECOND_IN_MS);
        }
    }

    areAnswersCorrect(): boolean {
        const correctAnswers = this.questions[this.currentQuestionIndex].choices.filter((choice) => choice.isCorrect);
        const selectedAnswers = this.selectedAnswerBoxes.map((box) => this.questions[this.currentQuestionIndex].choices[box - 1]);

        return selectedAnswers.length !== 0 &&
            selectedAnswers.length === correctAnswers.length &&
            selectedAnswers.every((selectedAnswer) => correctAnswers.includes(selectedAnswer));
    }

    addBoxValidationHighlight(state: string) {
        this.selectedAnswerBoxes.forEach((box) => {
            const selectedBox = document.getElementsByClassName('answer-box' + box);

            selectedBox[0].classList.remove('highlight-selected');
            selectedBox[0].classList.add('highlight-validated-' + state);
        });
    }

    removeBoxValidationHighlight() {
        this.validatedAnswerBoxes.forEach((box) => {
            const validatedBox = document.getElementsByClassName('answer-box' + box);

            if (validatedBox[0].classList.contains('highlight-validated-right')) {
                validatedBox[0].classList.remove('highlight-validated-right');
            } else if (validatedBox[0].classList.contains('highlight-validated-wrong')) {
                validatedBox[0].classList.remove('highlight-validated-wrong');
            }
        });
        this.selectedAnswerBoxes.length = 0;
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
