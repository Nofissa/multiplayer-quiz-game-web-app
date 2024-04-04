import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Question } from '@common/question';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

const QCM_MIN_TIME = 10;
const QRL_MIN_TIME = 20;
const PANIC_TICKS_PER_SECOND = 4;

@Component({
    selector: 'app-panic-mode-button',
    templateUrl: './panic-mode-button.component.html',
    styleUrls: ['./panic-mode-button.component.scss'],
})
export class PanicModeButtonComponent implements OnInit, OnDestroy {
    @Input() pin: string;
    isVisible: boolean = false;
    hasActivatedPanicMode: boolean = false;

    private currentQuestion: Question;
    private subscriptions: Subscription[] = [];

    constructor(
        private readonly gameService: GameService,
        private readonly timerService: TimerService,
    ) {}

    ngOnInit() {
        this.subscribeToGameEvents();
        this.subscribeToTimerEvents();
    }

    ngOnDestroy() {
        this.unsubscribeAll();
    }

    startPanicMode() {
        this.hasActivatedPanicMode = true;

        this.timerService.accelerateTimer(this.pin, PANIC_TICKS_PER_SECOND);
    }

    private subscribeToGameEvents() {
        this.subscriptions.push(
            this.gameService.onStartGame(this.pin, ({ question }) => {
                this.updateCurrentQuestion(question);
                this.reset();
            }),
            this.gameService.onNextQuestion(this.pin, ({ question }) => {
                this.updateCurrentQuestion(question);
                this.reset();
            }),
        );
    }

    private subscribeToTimerEvents() {
        this.subscriptions.push(
            this.timerService.onStartTimer(this.pin, ({ eventType, remainingTime }) => {
                this.updateVisibility(eventType, remainingTime);
            }),
            this.timerService.onTimerTick(this.pin, ({ eventType, remainingTime }) => {
                this.updateVisibility(eventType, remainingTime);
            }),
        );
    }

    private reset() {
        this.isVisible = false;
        this.hasActivatedPanicMode = false;
    }

    private updateCurrentQuestion(question: Question) {
        this.currentQuestion = question;
    }

    private updateVisibility(eventType: TimerEventType, remainingTime: number) {
        if (eventType === TimerEventType.Question && this.currentQuestion) {
            if (
                (this.currentQuestion.type === 'QCM' && remainingTime <= QCM_MIN_TIME) ||
                (this.currentQuestion.type === 'QRL' && remainingTime <= QRL_MIN_TIME)
            ) {
                this.isVisible = false;
            } else {
                this.isVisible = true;
            }
        }
    }

    private unsubscribeAll() {
        this.subscriptions.forEach((sub) => {
            if (sub && !sub.closed) {
                sub.unsubscribe();
            }
        });
    }
}
