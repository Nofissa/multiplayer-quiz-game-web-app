import { Component, HostListener } from '@angular/core';
import { map, take, timer } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    @HostListener('keydown', ['$event'])
    // message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    secondsLeft: number;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    frequenceOneSecond: number = 1000;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    timerDuration: number = 60;
    selectedAnswerBoxes: number[] = [];
    firstBoxHotkey: string = '1';
    secondBoxHotkey: string = '2';
    thirdBoxHotkey: string = '3';
    fourthBoxHotkey: string = '4';

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit() {
        // timer code source: https://www.codeproject.com/Questions/5349203/How-to-make-5-minute-countdown-timer-with-rxjs-and
        const countdown$ = timer(0, this.frequenceOneSecond).pipe(
            take(this.timerDuration),
            map((secondsElapsed) => this.timerDuration - secondsElapsed),
        );

        countdown$.subscribe((secondsLeft: number) => {
            this.secondsLeft = secondsLeft;
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

    handleKeyboardEvent(event: KeyboardEvent): void {
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
            default: {
                break;
            }
        }
    }
}
