import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MAX_MESSAGE_LENGTH, QRL_INACTIVITY_DELAY_MS, NOTICE_DURATION_MS, BLINK_DURATION_MS } from '@app/constants/constants';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Grade } from '@common/grade';
import { Player } from '@common/player';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { Question } from '@common/question';
import { QuestionType } from '@common/question-type';
import { TimerEventType } from '@common/timer-event-type';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-qrl-board',
    templateUrl: './qrl-board.component.html',
    styleUrls: ['./qrl-board.component.scss'],
    providers: [GameServicesProvider],
    animations: [
        trigger('blinkAnimation', [
            state('blink', style({ backgroundColor: 'green' })),
            transition('* => blink', [
                animate('0.5s ease-in-out', style({ backgroundColor: 'green' })),
                animate('0.5s ease-in-out', style({ backgroundColor: 'transparent' })),
            ]),
        ]),
        trigger('evaporateAnimation', [
            state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(100%)' }),
                animate('2s', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
            transition(':leave', [animate('2s', style({ opacity: 0, transform: 'translateY(-100%)' }))]),
        ]),
    ],
})
export class QrlBoardComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    @Input()
    isTest: boolean;

    @ViewChild('textarea') textarea: ElementRef;
    showNotification100: boolean = false;
    showNotification50: boolean = false;
    showNotification0: boolean = false;

    player: Player | null;
    remainingInputCount: number = MAX_MESSAGE_LENGTH;
    input: string = '';
    question: Question;
    hasSubmitted: boolean;
    isInEvaluation: boolean = false;
    formGroup: FormGroup;

    private readonly uuid = uuidv4();
    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly timerService: TimerService;
    private readonly playerService: PlayerService;

    private cachedEvaluation: QrlEvaluation | null = null;
    private isTyping: boolean = false;
    private interval: ReturnType<typeof setTimeout>;

    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        gameServicesProvider: GameServicesProvider,
        formBuilder: FormBuilder,
        private readonly subscriptionService: SubscriptionService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
        private readonly snackBar: MatSnackBar,
    ) {
        this.formGroup = formBuilder.group({
            message: [this.pin, [Validators.required, this.messageValidator()]],
        });
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.timerService = gameServicesProvider.timerService;
        this.playerService = gameServicesProvider.playerService;
    }

    ngOnInit() {
        const player = this.playerService.getCurrentPlayer(this.pin);

        if (player) {
            this.player = player;
        }

        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.loadNextQuestion(snapshot.quiz.questions[snapshot.currentQuestionIndex]);
        });
        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.subscriptionService.clear(this.uuid);
    }

    isQRL(question: Question) {
        return question.type === QuestionType.QRL;
    }

    updateRemainingInputCount() {
        this.remainingInputCount = MAX_MESSAGE_LENGTH - this.input.length;
        if (!this.isTyping) {
            this.isTyping = true;
            this.gameService.qrlInputChange(this.pin, this.isTyping);
        }

        clearInterval(this.interval);

        this.interval = setInterval(() => {
            this.isTyping = false;
            this.gameService.qrlInputChange(this.pin, this.isTyping);
            clearInterval(this.interval);
        }, QRL_INACTIVITY_DELAY_MS);
    }

    submitAnswer() {
        if (this.input.length <= MAX_MESSAGE_LENGTH) {
            this.gameService.qrlSubmit(this.pin, this.input.trim());
            this.remainingInputCount = MAX_MESSAGE_LENGTH;
            this.hasSubmitted = true;
            this.isInEvaluation = true;
            this.snackBar.open('Réponse soumise ✔', '', { duration: NOTICE_DURATION_MS, panelClass: ['submit-snackbar'] });
        } else if (this.input.length > MAX_MESSAGE_LENGTH) {
            this.openError('La réponse contient plus de 200 caractères');
        }
    }

    openConfirmationDialog() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: { prompt: 'Voulez-vous vraiment quitter la partie?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.playerService.playerAbandon(this.pin);
                const redirect = this.isTest ? '/create-game' : '/home';
                this.router.navigateByUrl(redirect);
            }
        });
    }

    private openError(message: string) {
        this.snackBar.open(message, undefined, {
            verticalPosition: 'top',
            duration: NOTICE_DURATION_MS,
            panelClass: ['error-snackbar'],
        });
    }

    private blinkTextArea(grade: Grade) {
        let classNameBlink = '';

        switch (grade) {
            case Grade.Bad:
                classNameBlink = 'blink-red';
                this.showNotification0 = true;
                break;
            case Grade.Average:
                classNameBlink = 'blink-yellow';
                this.showNotification50 = true;
                break;
            case Grade.Good:
                classNameBlink = 'blink';
                this.showNotification100 = true;
                break;
            default:
                break;
        }

        this.textarea.nativeElement.classList.add(classNameBlink);

        setTimeout(() => {
            this.textarea.nativeElement.classList.remove(classNameBlink);
            this.resetNotifications(grade);
        }, BLINK_DURATION_MS);
    }

    private resetNotifications(grade: Grade) {
        switch (grade) {
            case Grade.Bad:
                this.showNotification0 = false;
                break;
            case Grade.Average:
                this.showNotification50 = false;
                break;
            case Grade.Good:
                this.showNotification100 = false;
                break;
            default:
                break;
        }
    }

    private loadNextQuestion(question: Question) {
        this.hasSubmitted = false;
        this.cachedEvaluation = null;
        this.input = '';
        this.question = question;
    }

    private setupSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.gameService.onNextQuestion(pin, (data) => {
                this.loadNextQuestion(data.question);
            }),
            this.gameService.onQrlSubmit(this.pin, () => {
                if (this.question?.type !== QuestionType.QRL) {
                    return;
                }
                if (this.isTest && this.player) {
                    this.blinkTextArea(Grade.Good);
                    this.player.score += this.question.points;
                }
            }),
            this.gameService.onQrlEvaluate(pin, (evaluation) => {
                if (this.question?.type !== QuestionType.QRL) {
                    return;
                }
                if (this.playerService.getCurrentPlayer(pin)?.socketId === evaluation.player.socketId) {
                    this.cachedEvaluation = evaluation;
                }
                if (evaluation.isLast) {
                    if (this.player && this.cachedEvaluation) {
                        this.isInEvaluation = false;
                        this.player.score += this.cachedEvaluation?.score ?? 0;
                        this.blinkTextArea(this.cachedEvaluation.grade);
                    }
                }
            }),
            this.timerService.onTimerTick(pin, (payload) => {
                if (this.question?.type !== QuestionType.QRL) {
                    return;
                }
                if (!payload.remainingTime && payload.eventType === TimerEventType.Question && !this.hasSubmitted) {
                    this.submitAnswer();
                }
            }),
        );
    }

    private messageValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const message = control.value as string;
            return message?.length < MAX_MESSAGE_LENGTH ? null : { invalidMessage: true };
        };
    }
}
