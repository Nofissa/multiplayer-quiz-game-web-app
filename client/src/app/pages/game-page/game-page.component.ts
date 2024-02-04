import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { QuizHttpService } from '@app/services/quiz-http.service';
import { Subscription, map, take, timer } from 'rxjs';
import { oneSecond } from './game-page.constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    // animation from ChatGPT
    animations: [trigger('scale', [transition(':enter', [style({ transform: 'scale(0)' }), animate('1s', style({ transform: 'scale(1)' }))])])],
})
export class GamePageComponent {
    secondsLeft: number;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    timerDuration: number;
    selectedAnswerBoxes: number[] = [];
    validatedAnswerBoxes: number[] = [];
    firstBoxHotkey: string = '1';
    secondBoxHotkey: string = '2';
    thirdBoxHotkey: string = '3';
    fourthBoxHotkey: string = '4';
    questions: Question[];
    displayQuestion: boolean = true;
    currentQuestionIndex: number = 0;
    timerStarted: boolean = false;
    score: number = 0;
    feedbackMessage: string;
    feedbackMessageClass: string = 'feedback-message';
    quizID: string = '65bd135dacb6e994665ca0b7';
    private timerSubscription: Subscription;
    constructor(
        private quizHttpService: QuizHttpService,
        private dialog: MatDialog,
    ) {}

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        const focusedElement = document.activeElement as HTMLElement;

        if (focusedElement.tagName.toLowerCase() === 'textarea') {
            return;
        }

        switch (event.key) {
            case this.firstBoxHotkey: {
                event.preventDefault();
                this.toggleAnswerBox(parseInt(this.firstBoxHotkey, 10));
                break;
            }
            case this.secondBoxHotkey: {
                event.preventDefault();
                this.toggleAnswerBox(parseInt(this.secondBoxHotkey, 10));
                break;
            }
            case this.thirdBoxHotkey: {
                event.preventDefault();
                this.toggleAnswerBox(parseInt(this.thirdBoxHotkey, 10));
                break;
            }
            case this.fourthBoxHotkey: {
                event.preventDefault();
                this.toggleAnswerBox(parseInt(this.fourthBoxHotkey, 10));
                break;
            }
            case 'Enter': {
                event.preventDefault();
                this.validateChoices();
                break;
            }
            default: {
                break;
            }
        }
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit() {
        this.loadQuizQuestions();
    }

    loadQuizQuestions(): void {
        this.quizHttpService.getQuizById(this.quizID).subscribe({
            next: (quiz) => {
                this.questions = quiz.questions.map((question) => ({ ...question }));
                this.timerDuration = quiz.duration;
                if (this.questions.length === 0) {
                    this.displayQuestion = false;
                }
                this.startTimer();
                this.displayQuestion = true;
            },
        });
    }

    // timer inspired from ChatGPT and https://www.codeproject.com/Questions/5349203/How-to-make-5-minute-countdown-timer-with-rxjs-and
    startTimer() {
        const countdown$ = timer(0, oneSecond).pipe(
            take(this.timerDuration + 1),
            map((secondsElapsed) => this.timerDuration - secondsElapsed),
        );

        this.timerSubscription = countdown$.subscribe((secondsLeft: number) => {
            this.secondsLeft = secondsLeft;
            if (this.secondsLeft === 0) {
                this.displayQuestion = false;
                this.validateChoices();
                setTimeout(() => {
                    this.feedbackMessage = '';
                    if (this.currentQuestionIndex < this.questions.length - 1) {
                        this.removeBoxValidationHighlight();
                        this.currentQuestionIndex++;
                        this.startTimer();
                    } else {
                        this.displayQuestion = false;
                    }
                }, oneSecond);
            }
        });
        this.timerStarted = true;
    }

    stopTimer() {
        if (this.timerSubscription && !this.timerSubscription.closed) {
            this.timerSubscription.unsubscribe();
        }
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
            this.stopTimer();
        }
        this.checkAnswers();
        if (this.secondsLeft !== 0) {
            setTimeout(() => {
                this.feedbackMessage = '';
                if (this.currentQuestionIndex < this.questions.length - 1) {
                    this.removeBoxValidationHighlight();
                    this.currentQuestionIndex++;
                    this.startTimer();
                } else {
                    this.displayQuestion = false;
                }
            }, oneSecond);
        }
    }

    checkAnswers() {
        const { points } = this.questions[this.currentQuestionIndex];
        const correctAnswers: Choice[] = [];
        const incorrectAnswers: Choice[] = [];

        this.questions[this.currentQuestionIndex].choices.forEach((choice) => {
            if (choice.isCorrect) {
                correctAnswers.push(choice);
            } else {
                incorrectAnswers.push(choice);
            }
        });
        const selectedAnswers = this.selectedAnswerBoxes.map((box) => this.questions[this.currentQuestionIndex].choices[box - 1]);
        let correct = false;
        if (selectedAnswers.length !== 0) {
            correct =
                selectedAnswers.length === correctAnswers.length &&
                selectedAnswers.every((selectedAnswer) => correctAnswers.includes(selectedAnswer));
        }

        if (correct) {
            this.addBoxValidationHighlight('right');
            this.score += points;
            this.feedbackMessage = 'Bonne réponse! :)';
            this.feedbackMessageClass = 'correct-answer';
        } else {
            this.addBoxValidationHighlight('wrong');
            this.feedbackMessage = 'Mauvaise réponse :(';
            this.feedbackMessageClass = 'incorrect-answer';
        }
        this.displayQuestion = true;
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

    openConfirmationDialog(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: { prompt: 'Voulez-vous vraiment quitter la partie?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                location.href = '/home';
            }
        });
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnDestroy() {
        this.stopTimer();
    }
}
