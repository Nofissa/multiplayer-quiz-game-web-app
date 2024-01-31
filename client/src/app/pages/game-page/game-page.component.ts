import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener } from '@angular/core';
import { QuestionHttpService } from '@app/services/question-http.service';
import { Subscription, map, take, timer } from 'rxjs';
import { oneSecond } from './game-page.constants';
import { Question } from 'c:/Users/user/source/repos/LOG2990-206/client/src/app/interfaces/question';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    // animation from ChatGPT
    animations: [trigger('scale', [transition(':enter', [style({ transform: 'scale(0)' }), animate('2s', style({ transform: 'scale(1)' }))])])],
})
export class GamePageComponent {
    // message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    secondsLeft: number = 0;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    timerDuration: number = 10;
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
    points: number = 0;
    feedbackMessage: string;
    feedbackMessageClass: string = 'feedback-message';
    private timerSubscription: Subscription;
    constructor(private questionHttpService: QuestionHttpService) {}

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
        this.loadQuestions();
        // this.timerDuration = this.questions[this.currentQuestionIndex].timeInSeconds;
        this.startTimer();
    }

    loadQuestions(): void {
        this.questionHttpService.getAllQuestions().subscribe({
            next: (questions) => {
                this.questions = questions.map((question) => ({
                    ...question,
                    allAnswers: [...question.correctAnswers, ...question.incorrectAnswers],
                }));
                if (this.questions.length === 0) {
                    this.displayQuestion = false;
                }
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
                // this.secondsLeft = 0;
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
        const { correctAnswers, allAnswers, pointValue } = this.questions[this.currentQuestionIndex];
        const selectedAnswers = this.selectedAnswerBoxes.map((box) => allAnswers[box - 1]);
        let correct = false;
        if (selectedAnswers.length !== 0) {
            correct =
                selectedAnswers.length === correctAnswers.length &&
                selectedAnswers.every((selectedAnswer) => correctAnswers.includes(selectedAnswer));
        }

        if (correct) {
            this.addBoxValidationHighlight('right');
            this.points += pointValue;
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
            validatedBox[0].classList.remove('highlight-validated-right');
            validatedBox[0].classList.remove('highlight-validated-wrong');
        });
        this.selectedAnswerBoxes.length = 0;
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnDestroy() {
        this.stopTimer();
    }
}
