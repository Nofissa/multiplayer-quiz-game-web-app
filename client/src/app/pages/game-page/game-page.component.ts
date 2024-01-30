import { Component, HostListener } from '@angular/core';
import { QuestionHttpService } from '@app/services/question-http.service';
import { Subscription, map, take, timer } from 'rxjs';
import { frequenceOneSecond } from './game-page.constants';
import { Question } from 'c:/Users/user/source/repos/LOG2990-206/client/src/app/interfaces/question';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    // message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    secondsLeft: number = 0;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    timerDuration: number = 60;
    selectedAnswerBoxes: number[] = [];
    validatedAnswerBoxes: number[] = [];
    firstBoxHotkey: string = '1';
    secondBoxHotkey: string = '2';
    thirdBoxHotkey: string = '3';
    fourthBoxHotkey: string = '4';
    questions: Question[];
    currentQuestionText: string;
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
        this.startTimer();
    }

    loadQuestions(): void {
        this.questionHttpService.getAllQuestions().subscribe({
            next: (questions) => {
                this.questions = questions;
                if (questions && questions.length > 0) {
                    this.currentQuestionText = questions[0].question;
                }
            },
        });
    }

    // timer inspired from ChatGPT and https://www.codeproject.com/Questions/5349203/How-to-make-5-minute-countdown-timer-with-rxjs-and
    startTimer() {
        const countdown$ = timer(0, frequenceOneSecond).pipe(
            take(this.timerDuration + 1),
            map((secondsElapsed) => this.timerDuration - secondsElapsed),
        );

        this.timerSubscription = countdown$.subscribe((secondsLeft: number) => {
            this.secondsLeft = secondsLeft;
            if (this.secondsLeft === 0) {
                this.validateChoices();
            }
        });
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
            const selectedBox = document.getElementsByClassName('answer-box' + box);
            selectedBox[0].classList.remove('highlight-selected');
            selectedBox[0].classList.add('highlight-validated');
            this.validatedAnswerBoxes.push(box);
        }
        if (this.validatedAnswerBoxes.length !== 0) {
            const box1 = document.getElementsByClassName('answer-box1');
            box1[0].classList.add('disable-click');
            const box2 = document.getElementsByClassName('answer-box2');
            box2[0].classList.add('disable-click');
            const box3 = document.getElementsByClassName('answer-box3');
            box3[0].classList.add('disable-click');
            const box4 = document.getElementsByClassName('answer-box4');
            box4[0].classList.add('disable-click');
            this.stopTimer();
        }
    }
}
