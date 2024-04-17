import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PANIC_TICKS_PER_SECOND, QCM_MIN_TIME, QRL_MIN_TIME } from '@app/constants/constants';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Question } from '@common/question';
import { QuestionType } from '@common/question-type';
import { TimerEventType } from '@common/timer-event-type';
import { Subscription } from 'rxjs';

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
            this.gameService.onQcmSubmit(this.pin, (evaluation) => {
                if (evaluation.isLast) {
                    this.isVisible = false;
                }
            }),
            this.gameService.onQrlSubmit(this.pin, (submission) => {
                if (submission.isLast) {
                    this.isVisible = false;
                }
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
                (this.currentQuestion.type === QuestionType.QCM && remainingTime <= QCM_MIN_TIME) ||
                (this.currentQuestion.type === QuestionType.QRL && remainingTime <= QRL_MIN_TIME)
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
