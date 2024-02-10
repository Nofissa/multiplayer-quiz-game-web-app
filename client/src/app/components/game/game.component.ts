import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Choice } from '@app/interfaces/choice';
import { Quiz } from '@app/interfaces/quiz';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { KeyBindingService } from '@app/services/key-binding.service';
import { TimerService } from '@app/services/timer-service';

const THREE_SECOND_IN_MS = 3000;

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
    // animation from ChatGPT
    animations: [trigger('scale', [transition(':enter', [style({ transform: 'scale(0)' }), animate('1s', style({ transform: 'scale(1)' }))])])],
})
export class GameComponent implements OnInit, OnChanges, OnDestroy {
    @Input()
    quiz: Quiz;
    @Input()
    isTest: boolean;

    currentQuestionIndex: number = 0;
    selectedChoices: Choice[] = [];
    secondsLeft: number;
    score: number = 0;
    feedbackMessage: string;
    feedbackMessageClass: string = 'feedback-message';

    private readonly timerService: TimerService;
    private readonly keyBindingService: KeyBindingService;

    constructor(
        gameServicesProvider: GameServicesProvider,
        private readonly dialog: MatDialog,
        private readonly router: Router,
    ) {
        this.timerService = gameServicesProvider.timer;
        this.keyBindingService = gameServicesProvider.keyBinding;
    }

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
    }

    ngOnChanges() {
        if (this.quiz) {
            this.startTimer();
        }
    }

    ngOnDestroy() {
        this.timerService.stopTimer();
    }

    setupKeyBindings() {
        ['1', '2', '3', '4'].forEach((x) => {
            this.keyBindingService.registerKeyBinding(x, () => {
                const choiceIndex = parseInt(x, 10) - 1;

                this.toggleChoiceSelection(this.quiz.questions[this.currentQuestionIndex].choices[choiceIndex]);
            });
        });

        this.keyBindingService.registerKeyBinding('Enter', () => {
            this.validateChoices();
        });
    }

    startTimer() {
        this.timerService.startTimer(this.quiz.duration, (secondsLeft: number) => {
            this.secondsLeft = secondsLeft;

            if (this.secondsLeft === 0) {
                this.validateChoices();

                this.nextQuestion();
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
            this.score += this.quiz.questions[this.currentQuestionIndex].points;
            this.feedbackMessage = 'Bonne réponse! :)';
            this.feedbackMessageClass = 'correct-answer';
        } else {
            this.feedbackMessage = 'Mauvaise réponse :(';
            this.feedbackMessageClass = 'incorrect-answer';
        }
    }

    nextQuestion() {
        setTimeout(() => {
            if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
                this.feedbackMessage = '';
                this.currentQuestionIndex++;
                this.selectedChoices = [];
                this.startTimer();

                return;
            }

            this.router.navigateByUrl('/home');
        }, THREE_SECOND_IN_MS);
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