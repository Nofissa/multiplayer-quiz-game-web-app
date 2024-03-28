import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Player } from '@common/player';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { Question } from '@common/question';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

const MAX_MESSAGE_LENGTH = 200;
const THREE_SECONDS_MS = 3000;
const GRADE50 = 50;
const GRADE100 = 100;

@Component({
    selector: 'app-qrlboard',
    templateUrl: './qrlboard.component.html',
    styleUrls: ['./qrlboard.component.scss'],
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
export class QRLboardComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    @Input()
    isTest: boolean;

    @ViewChild('textarea') textarea: ElementRef;
    showNotification100: boolean = false;

    player: Player | null;
    remainingInputCount: number = MAX_MESSAGE_LENGTH;
    input: string = '';
    question: Question;
    questionIsOver: boolean;
    hasSubmitted: boolean;
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

    blinkTextArea(grade: number) {
        switch (grade) {
            case 0: {
                this.textarea.nativeElement.classList.add('blink-red');
                setTimeout(() => {
                    this.textarea.nativeElement.classList.remove('blink-red');
                }, THREE_SECONDS_MS);
                break;
            }
            case GRADE50: {
                this.textarea.nativeElement.classList.add('blink-yellow');
                setTimeout(() => {
                    this.textarea.nativeElement.classList.remove('blink-yellow');
                }, THREE_SECONDS_MS);
                break;
            }
            case GRADE100: {
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
        if (!isOnlyWhitespace && this.input.length < MAX_MESSAGE_LENGTH) {
            this.gameService.qrlSubmit(this.pin, this.input.trim());
            this.input = '';
            this.remainingInputCount = MAX_MESSAGE_LENGTH;
        }
        this.hasSubmitted = true;
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

    private loadNextQuestion(question: Question) {
        this.questionIsOver = false;
        this.hasSubmitted = false;
        this.cachedEvaluation = null;
        this.question = question;
    }

    private setupSubscriptions(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onNextQuestion(pin, (data) => {
                this.loadNextQuestion(data.question);
            }),
            this.gameService.onQrlEvaluate(pin, (evaluation) => {
                if (this.playerService.getCurrentPlayer(pin)?.socketId === evaluation.clientId) {
                    this.cachedEvaluation = evaluation;
                }
                if (evaluation.isLast) {
                    this.questionIsOver = true;
                    if (this.player) {
                        if (this.isTest) {
                            this.blinkTextArea(GRADE100);
                            this.player.score += this.question.points;
                        } else {
                            this.player.score += this.cachedEvaluation?.score ?? 0;
                        }
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
