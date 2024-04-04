import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Grade } from '@common/grade';
import { Player } from '@common/player';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { Question } from '@common/question';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

const MAX_MESSAGE_LENGTH = 200;
const THREE_SECONDS_MS = 3000;
const ERROR_DURATION = 5000;

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
    questionIsOver: boolean;
    hasSubmitted: boolean;
    isInEvaluation: boolean = false;
    cachedEvaluation: QrlEvaluation | null = null;
    formGroup: FormGroup;

    readonly gameHttpService: GameHttpService;
    readonly gameService: GameService;
    readonly timerService: TimerService;

    private isTyping: boolean = false;
    private interval: ReturnType<typeof setTimeout>;
    private eventSubscriptions: Subscription[] = [];

    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        gameServicesProvider: GameServicesProvider,
        formBuilder: FormBuilder,
        private readonly playerService: PlayerService,
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
        this.gameService.qrlInputChange(this.pin, this.isTyping);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (sub && !sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    isQRL(): boolean {
        return this.question.type === 'QRL';
    }

    updateRemainingInputCount() {
        this.remainingInputCount = MAX_MESSAGE_LENGTH - this.input.length;
        const FIVE_SECONDS_MS = 5000;
        if (!this.isTyping) {
            this.isTyping = true;
            this.gameService.qrlInputChange(this.pin, this.isTyping);
        }

        this.interval = setInterval(() => {
            this.isTyping = false;
            this.gameService.qrlInputChange(this.pin, this.isTyping);
            clearInterval(this.interval);
        }, FIVE_SECONDS_MS);
    }

    submitAnswer() {
        const isOnlyWhitespace = /^\s*$/.test(this.input);
        if (!isOnlyWhitespace && this.input.length <= MAX_MESSAGE_LENGTH) {
            this.gameService.qrlSubmit(this.pin, this.input.trim());
            this.remainingInputCount = MAX_MESSAGE_LENGTH;
            this.hasSubmitted = true;
            this.isInEvaluation = true;
        } else if (isOnlyWhitespace) {
            this.openError('La réponse est vide');
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

    openError(message: string) {
        this.snackBar.open(message, undefined, {
            verticalPosition: 'top',
            duration: ERROR_DURATION,
            panelClass: ['error-snackbar'],
        });
    }

    blinkTextArea(grade: Grade) {
        switch (grade) {
            case Grade.Bad: {
                this.textarea.nativeElement.classList.add('blink-red');
                setTimeout(() => {
                    this.textarea.nativeElement.classList.remove('blink-red');
                }, THREE_SECONDS_MS);
                this.showNotification0 = true;
                setTimeout(() => {
                    this.showNotification0 = false;
                }, THREE_SECONDS_MS);
                break;
            }
            case Grade.Average: {
                this.textarea.nativeElement.classList.add('blink-yellow');
                setTimeout(() => {
                    this.textarea.nativeElement.classList.remove('blink-yellow');
                }, THREE_SECONDS_MS);
                this.showNotification50 = true;
                setTimeout(() => {
                    this.showNotification50 = false;
                }, THREE_SECONDS_MS);
                break;
            }
            case Grade.Good: {
                this.textarea.nativeElement.classList.add('blink');
                setTimeout(() => {
                    this.textarea.nativeElement.classList.remove('blink');
                }, THREE_SECONDS_MS);
                this.showNotification100 = true;
                setTimeout(() => {
                    this.showNotification100 = false;
                }, THREE_SECONDS_MS);
                break;
            }
            default: {
                break;
            }
        }
    }

    private loadNextQuestion(question: Question) {
        this.questionIsOver = false;
        this.hasSubmitted = false;
        this.cachedEvaluation = null;
        this.input = '';
        this.question = question;
    }

    private setupSubscriptions(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onNextQuestion(pin, (data) => {
                this.loadNextQuestion(data.question);
            }),
            this.gameService.onQrlSubmit(this.pin, () => {
                if (this.isTest && this.player) {
                    this.blinkTextArea(Grade.Good);
                    this.player.score += this.question.points;
                }
            }),
            this.gameService.onQrlEvaluate(pin, (evaluation) => {
                if (this.playerService.getCurrentPlayer(pin)?.socketId === evaluation.player.socketId) {
                    this.cachedEvaluation = evaluation;
                }
                if (evaluation.isLast) {
                    this.questionIsOver = true;
                    if (this.player && this.cachedEvaluation) {
                        this.isInEvaluation = false;
                        this.player.score += this.cachedEvaluation?.score ?? 0;
                        this.blinkTextArea(this.cachedEvaluation.grade);
                    }
                }
            }),
            this.timerService.onTimerTick(pin, (payload) => {
                if (!payload.remainingTime && payload.eventType === TimerEventType.Question && !this.hasSubmitted) {
                    this.submitAnswer();
                }
            }),
        );
    }

    private messageValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const message = control.value as string;
            const isOnlyWhitespace = /^\s*$/.test(message);
            return !isOnlyWhitespace && message?.length < MAX_MESSAGE_LENGTH ? null : { invalidMessage: true };
        };
    }
}
