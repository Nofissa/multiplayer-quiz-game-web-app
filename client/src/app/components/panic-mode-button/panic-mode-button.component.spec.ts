import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameService, GameService as GameServiceMock } from '@app/services/game/game-service/game.service';
import { TimerService, TimerService as TimerServiceMock } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Question } from '@common/question';
import { QuestionPayload } from '@common/question-payload';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Observable, Observer, of, Subscription } from 'rxjs';
import { io } from 'socket.io-client';
import { PanicModeButtonComponent } from './panic-mode-button.component';
import { QuestionType } from '@common/question-type';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QrlSubmission } from '@common/qrl-submission';

describe('PanicModeButtonComponent', () => {
    let component: PanicModeButtonComponent;
    let fixture: ComponentFixture<PanicModeButtonComponent>;
    let gameServiceMock: jasmine.SpyObj<GameService>;
    let timerServiceMock: jasmine.SpyObj<TimerService>;
    let webSocketServiceMock: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;

    beforeEach(async () => {
        gameServiceMock = jasmine.createSpyObj('GameService', ['onStartGame', 'onNextQuestion', 'onQcmSubmit', 'onQrlSubmit']);
        timerServiceMock = jasmine.createSpyObj('TimerService', ['onStartTimer', 'onTimerTick', 'accelerateTimer']);
        webSocketServiceMock = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], {
            socketInstance: io(),
        });

        TestBed.configureTestingModule({
            declarations: [PanicModeButtonComponent],
            providers: [
                { provide: GameServiceMock, useValue: gameServiceMock },
                { provide: TimerServiceMock, useValue: timerServiceMock },
            ],
        });

        webSocketServiceMock.on.and.callFake(<T>(eventName: string, func: (data: T) => void) => {
            return new Observable<T>((observer: Observer<T>) => {
                webSocketServiceMock['socketInstance'].on(eventName, (data: T) => {
                    observer.next(data);
                });

                return () => {
                    webSocketServiceMock['socketInstance'].off(eventName);
                };
            }).subscribe(func);
        });

        socketServerMock = new SocketServerMock([webSocketServiceMock['socketInstance']]);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PanicModeButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component['subscriptions'] = [];
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to game events', () => {
        const NUMBER_OF_SUBS = 4;
        component['subscribeToGameEvents']();
        expect(component['subscriptions'].length).toBe(NUMBER_OF_SUBS);
    });

    it('should subscribe to timer events', () => {
        component['subscribeToTimerEvents']();
        expect(component['subscriptions'].length).toBe(2);
    });

    it('should start panic mode', () => {
        component.startPanicMode();

        expect(component.hasActivatedPanicMode).toBeTruthy();
        expect(timerServiceMock.accelerateTimer).toHaveBeenCalled();
    });

    it('should reset panic mode', () => {
        component['reset']();

        expect(component.isVisible).toBeFalsy();

        expect(component.hasActivatedPanicMode).toBeFalsy();
    });

    it('should update current question on game events', () => {
        const question = {} as Question;
        component['updateCurrentQuestion'](question);
        expect(component['currentQuestion']).toBe(question);
    });

    it('should update visibility based on timer events', () => {
        const qcmMinTime = 10;
        component['currentQuestion'] = { type: QuestionType.QCM } as Question;

        component['updateVisibility'](TimerEventType.Question, qcmMinTime + 1);
        expect(component.isVisible).toBe(true);

        component['updateVisibility'](TimerEventType.Question, qcmMinTime);
        expect(component.isVisible).toBe(false);
    });

    it('should update visibility based on timer events for QRL question type', () => {
        const qrlMinTime = 20;

        component['currentQuestion'] = { type: QuestionType.QRL } as Question;
        component['updateVisibility'](TimerEventType.Question, qrlMinTime + 1);
        expect(component.isVisible).toBe(true);

        component['updateVisibility'](TimerEventType.Question, qrlMinTime);
        expect(component.isVisible).toBe(false);
    });

    it('should unsubscribe from all subscriptions when calling unsubscribeAll', () => {
        component['subscriptions'].push(new Subscription(), new Subscription());
        component.ngOnDestroy();
        expect(component['subscriptions'].every((sub) => sub.closed)).toBe(true);
    });

    it('should call updateCurrentQuestion and reset on startGame event', () => {
        gameServiceMock.onStartGame.and.callFake((_pin: string, callback: (payload: QuestionPayload) => void) => {
            const payload = {} as QuestionPayload;
            callback(payload);

            return of(payload).subscribe(callback);
        });

        const updateCurrentQuestionSpy = spyOn(component, 'updateCurrentQuestion' as never);
        const resetSpy = spyOn(component, 'reset' as never);

        component.ngOnInit();
        socketServerMock.emit('startGame', {} as never);

        expect(updateCurrentQuestionSpy).toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalled();
    });

    it('should call updateCurrentQuestion and reset on nextQuestion event', () => {
        gameServiceMock.onNextQuestion.and.callFake((_pin: string, callback: (payload: QuestionPayload) => void) => {
            const payload = {} as QuestionPayload;
            callback(payload);

            return of(payload).subscribe(callback);
        });

        const updateCurrentQuestionSpy = spyOn(component, 'updateCurrentQuestion' as never);
        const resetSpy = spyOn(component, 'reset' as never);

        component.ngOnInit();
        socketServerMock.emit('nextQuestion', {} as never);

        expect(updateCurrentQuestionSpy).toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalled();
    });

    it('should be invisible if last QCM was submitted', () => {
        gameServiceMock.onQcmSubmit.and.callFake((_pin: string, callback: (evaluation: QcmEvaluation) => void) => {
            const payload = { isLast: true } as QcmEvaluation;
            callback(payload);

            return of(payload).subscribe(callback);
        });

        component.ngOnInit();
        socketServerMock.emit('qcmSubmit', {} as never);

        expect(component['isVisible']).toBeFalse();
    });

    it('should be invisible if last QRL was submitted', () => {
        gameServiceMock.onQrlSubmit.and.callFake((_pin: string, callback: (submission: QrlSubmission) => void) => {
            const payload = { isLast: true } as QrlSubmission;
            callback(payload);

            return of(payload).subscribe(callback);
        });

        component.ngOnInit();
        socketServerMock.emit('qrlSubmit', {} as never);

        expect(component['isVisible']).toBeFalse();
    });

    it('should call updateVisibility on startTimer event', () => {
        timerServiceMock.onStartTimer.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = {} as TimerPayload;
            callback(payload);

            return of(payload).subscribe(callback);
        });

        const updateVisibilitySpy = spyOn(component, 'updateVisibility' as never);

        component.ngOnInit();
        socketServerMock.emit('startTimer', {} as never);

        expect(updateVisibilitySpy).toHaveBeenCalled();
    });

    it('should call updateVisibility on timerTick event', () => {
        timerServiceMock.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = {} as TimerPayload;
            callback(payload);

            return of(payload).subscribe(callback);
        });

        const updateVisibilitySpy = spyOn(component, 'updateVisibility' as never);

        component.ngOnInit();
        socketServerMock.emit('timerTick', {} as never);

        expect(updateVisibilitySpy).toHaveBeenCalled();
    });
});
