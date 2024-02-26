import { Component, Input, HostListener, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Quiz } from '@app/interfaces/quiz';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Choice } from '@common/choice';

const THREE_SECOND_IN_MS = 3000;

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
    providers: [GameServicesProvider],
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
    questionValidated: boolean = false;

    readonly keyBindingService: KeyBindingService;
    readonly timerService: TimerService;

    // eslint-disable-next-line max-params
    constructor(
        gameServicesProvider: GameServicesProvider,
        private readonly dialog: MatDialog,
        private readonly router: Router,
    ) {
        this.timerService = gameServicesProvider.timer;
        this.keyBindingService = gameServicesProvider.keyBinding;
    }

    get time(): number {
        return 0;
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
        return;
        // this.timerService.stopTimer();
    }

    setupKeyBindings() {
        ['1', '2', '3', '4'].forEach((x) => {
            this.keyBindingService.registerKeyBinding(x, () => {
                const choiceIndex = parseInt(x, 10) - 1;
                if (!this.questionValidated) {
                    this.toggleChoiceSelection(this.quiz.questions[this.currentQuestionIndex].choices[choiceIndex]);
                }
            });
        });

        this.keyBindingService.registerKeyBinding('Enter', () => {
            if (!this.questionValidated) {
                this.validateChoices();
            }
        });
    }

    startTimer() {
        // this.timerService.startTimer(this.quiz.duration);
        // if (this.timerService.onTick) {
        //     this.timerService.onTick.subscribe(() => {
        //         // this.secondsLeft = this.time;
        //         if (this.time === 0) {
        //             this.validateChoices();
        //         }
        //     });
        // }
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

    allocatePoints(points: number) {
        if (points) {
            this.score += points;
            this.feedbackMessage = 'Bonne réponse! :) (+20%)';
            this.feedbackMessageClass = 'correct-answer';
        } else {
            this.feedbackMessage = 'Mauvaise réponse :(';
            this.feedbackMessageClass = 'incorrect-answer';
        }
    }

    validateChoices() {
        // this.timerService.stopTimer();
        this.questionValidated = true;
        // lint disabled on this line because it's a mongodb id
        // eslint-disable-next-line no-underscore-dangle
        // this.gameService.validateAnswers(this.selectedChoices, this.quiz._id, this.currentQuestionIndex).subscribe({
        //     next: (response: EvaluationPayload) => {
        //         this.allocatePoints(response.score);
        //     },
        // });
        this.nextQuestion();
    }

    nextQuestion() {
        setTimeout(() => {
            if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
                this.feedbackMessage = '';
                this.feedbackMessageClass = '';
                this.currentQuestionIndex++;
                this.questionValidated = false;
                this.selectedChoices = [];
                this.startTimer();

                return;
            }
            const redirect = this.isTest ? '/create-game' : '/home';
            this.router.navigateByUrl(redirect);
        }, THREE_SECOND_IN_MS);
    }

    openConfirmationDialog() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: { prompt: 'Voulez-vous vraiment quitter la partie?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                const redirect = this.isTest ? '/create-game' : '/home';
                this.router.navigateByUrl(redirect);
            }
        });
    }
}
