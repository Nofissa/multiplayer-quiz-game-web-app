import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { NOTICE_DURATION_MS, NOT_FOUND_INDEX } from '@app/constants/constants';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { PlayerService } from '@app/services/player/player.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameSnapshot } from '@common/game-snapshot';
import { Player } from '@common/player';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { Question } from '@common/question';
import { QuestionType } from '@common/question-type';
import { TimerEventType } from '@common/timer-event-type';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-qcm-board',
    templateUrl: './qcm-board.component.html',
    styleUrls: ['./qcm-board.component.scss'],
    providers: [GameServicesProvider],
})
export class QcmBoardComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    @Input()
    isTest: boolean;

    player: Player | null;
    question: Question;
    questionIsOver: boolean;
    hasSubmitted: boolean;
    selectedChoiceIndexes: number[];

    private cachedEvaluation: QcmEvaluation | null = null;
    private isInTransition: boolean;
    private readonly uuid = uuidv4();
    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly timerService: TimerService;
    private readonly playerService: PlayerService;
    private readonly keyBindingService: KeyBindingService;

    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        gameServicesProvider: GameServicesProvider,
        private readonly subscriptionService: SubscriptionService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
        private readonly snackBar: MatSnackBar,
    ) {
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.timerService = gameServicesProvider.timerService;
        this.playerService = gameServicesProvider.playerService;
        this.keyBindingService = gameServicesProvider.keyBindingService;
    }

    private get disableShortcuts(): boolean {
        return this.hasSubmitted || !this.isQCM(this.question);
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        const focusedElement = document.activeElement as HTMLElement;

        if (this.disableShortcuts || focusedElement.tagName.toLowerCase() === 'textarea' || this.isInTransition) {
            return;
        }

        const executor = this.keyBindingService.getExecutor(event.key);

        if (executor) {
            event.preventDefault();
            executor();
        }
    }

    ngOnInit() {
        const player = this.playerService.getCurrentPlayer(this.pin);
        if (player) {
            this.player = player;
        }
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot: GameSnapshot) => {
            this.loadNextQuestion(snapshot.quiz.questions[snapshot.currentQuestionIndex]);
        });
        this.setupSubscriptions(this.pin);
        this.setupKeyBindings();
    }

    ngOnDestroy() {
        this.subscriptionService.clear(this.uuid);
    }

    submitChoices() {
        this.hasSubmitted = true;
        this.gameService.qcmSubmit(this.pin);
        this.snackBar.open('Réponse soumise ✔', '', { duration: NOTICE_DURATION_MS, panelClass: ['submit-snackbar'] });
    }

    toggleSelectChoice(choiceIndex: number) {
        if (!this.isQCM(this.question)) {
            return;
        }
        const foundIndex = this.selectedChoiceIndexes.indexOf(choiceIndex);

        if (foundIndex !== NOT_FOUND_INDEX) {
            this.selectedChoiceIndexes.splice(foundIndex, 1);
        } else {
            this.selectedChoiceIndexes.push(choiceIndex);
        }

        this.gameService.qcmToggleChoice(this.pin, choiceIndex);
    }

    openConfirmationDialog() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: { prompt: 'Voulez-vous vraiment quitter la partie?' },
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.playerService.playerAbandon(this.pin);
                const redirect = this.isTest ? '/create-game' : '/home';
                this.router.navigateByUrl(redirect);
            }
        });
    }

    isQCM(question: Question) {
        return question?.type === QuestionType.QCM;
    }

    private loadNextQuestion(question: Question) {
        const transitionDuration = 5000;
        this.questionIsOver = false;
        this.hasSubmitted = false;
        this.selectedChoiceIndexes = [];
        this.cachedEvaluation = null;
        this.question = question;
        this.isInTransition = true;
        setTimeout(() => {
            this.isInTransition = false;
        }, transitionDuration);
    }

    private setupSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.gameService.onNextQuestion(pin, (data) => {
                this.loadNextQuestion(data.question);
            }),
            this.gameService.onQcmSubmit(pin, (evaluation) => {
                if (this.question?.type !== QuestionType.QCM) {
                    return;
                }
                if (this.playerService.getCurrentPlayer(pin)?.socketId === evaluation.player.socketId) {
                    this.cachedEvaluation = evaluation;
                }
                if (evaluation.isLast) {
                    this.questionIsOver = true;
                    if (this.player) {
                        this.player.score += this.cachedEvaluation !== null ? this.cachedEvaluation.score : 0;
                    }
                }
            }),
            this.timerService.onTimerTick(pin, (payload) => {
                if (this.question?.type !== QuestionType.QCM) {
                    return;
                }
                if (!payload.remainingTime && payload.eventType === TimerEventType.Question && !this.hasSubmitted) {
                    this.submitChoices();
                }
            }),
        );
    }

    private setupKeyBindings() {
        ['1', '2', '3', '4'].forEach((x) => {
            this.keyBindingService.registerKeyBinding(x, () => {
                if (this.question.type !== QuestionType.QCM) {
                    return;
                }
                const choiceIndex = parseInt(x, 10) - 1;
                this.toggleSelectChoice(choiceIndex);
            });
        });

        this.keyBindingService.registerKeyBinding('Enter', this.submitChoices.bind(this));
    }
}
