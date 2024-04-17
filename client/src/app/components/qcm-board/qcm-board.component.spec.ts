import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { PlayerService } from '@app/services/player/player.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { TimerService } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { lastPlayerEvaluationStub } from '@app/test-stubs/evaluation.stubs';
import { firstPlayerStub } from '@app/test-stubs/player.stubs';
import { qcmQuestionStub } from '@app/test-stubs/question.stubs';
import { quizStub } from '@app/test-stubs/quiz.stubs';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { GameEventPayload } from '@common/game-event-payload';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { Question } from '@common/question';
import { QuestionType } from '@common/question-type';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Observable, of } from 'rxjs';
import { io } from 'socket.io-client';
import { QcmBoardComponent } from './qcm-board.component';

const gameSnapshotStub: GameSnapshot = {
    players: [],
    chatlogs: [],
    quiz: quizStub(),
    state: GameState.Paused,
    currentQuestionIndex: 0,
    questionQcmSubmissions: [],
    questionQrlSubmission: [],
    questionQrlEvaluation: [],
};

const observableSnapShot = of(gameSnapshotStub);

describe('QcmBoardComponent', () => {
    let component: QcmBoardComponent;
    let fixture: ComponentFixture<QcmBoardComponent>;
    let gameHttpServiceMock: jasmine.SpyObj<GameHttpService>;
    let playerServiceMock: jasmine.SpyObj<PlayerService>;
    let keyBindingServiceMock: jasmine.SpyObj<KeyBindingService>;
    let gameServiceMock: jasmine.SpyObj<GameService>;
    let matDialogMock: jasmine.SpyObj<MatDialog>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;
    let routerSpy: jasmine.SpyObj<Router>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    let timerServiceMock: jasmine.SpyObj<TimerService>;
    let subscriptionServiceMock: jasmine.SpyObj<SubscriptionService>;

    beforeEach(() => {
        gameHttpServiceMock = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        playerServiceMock = jasmine.createSpyObj('PlayerService', ['getCurrentPlayer', 'playerAbandon']);
        keyBindingServiceMock = jasmine.createSpyObj('KeyBindingService', ['setupKeyBindings', 'getExecutor', 'registerKeyBinding']);
        gameServiceMock = jasmine.createSpyObj('GameService', ['qcmSubmit', 'nextQuestion', 'onNextQuestion', 'onQcmSubmit', 'qcmToggleChoice']);
        matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef<ConfirmationDialogComponent>', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], { socketInstance: io() });
        timerServiceMock = jasmine.createSpyObj('TimerService', ['onTimerTick']);
        subscriptionServiceMock = jasmine.createSpyObj<SubscriptionService>(['add', 'clear']);

        TestBed.configureTestingModule({
            declarations: [QcmBoardComponent, ConfirmationDialogComponent],
            imports: [MatSnackBarModule, RouterTestingModule, MatDialogModule, BrowserAnimationsModule],
            providers: [
                { provide: GameHttpService, useValue: gameHttpServiceMock },
                { provide: PlayerService, useValue: playerServiceMock },
                { provide: KeyBindingService, useValue: keyBindingServiceMock },
                { provide: GameService, useValue: gameServiceMock },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: Router, useValue: routerSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: TimerService, useValue: timerServiceMock },
                { provide: SubscriptionService, useValue: subscriptionServiceMock },
                MatSnackBar,
            ],
        }).compileComponents();

        webSocketServiceSpy = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;

        webSocketServiceSpy.on.and.callFake(<T>(eventName: string, func: (data: T) => void) => {
            return new Observable<T>((observer) => {
                webSocketServiceSpy['socketInstance'].on(eventName, (data) => {
                    observer.next(data);
                });

                return () => {
                    webSocketServiceSpy['socketInstance'].off(eventName);
                };
            }).subscribe(func);
        });

        socketServerMock = new SocketServerMock([webSocketServiceSpy['socketInstance']]);
        gameHttpServiceMock.getGameSnapshotByPin.and.returnValue(observableSnapShot);
        playerServiceMock.getCurrentPlayer.and.returnValue(firstPlayerStub());
        gameServiceMock.onNextQuestion.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('nextQuestion', applyIfPinMatches(pin, callback));
        });
        timerServiceMock.onTimerTick.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('timerTick', applyIfPinMatches(pin, callback));
        });
        gameServiceMock.onQcmSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('submitChoices', applyIfPinMatches(pin, callback));
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QcmBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameServiceMock.nextQuestion.calls.reset();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should ngOnInit', () => {
        const dummyPin = '123';
        component.pin = dummyPin;
        spyOn(component, 'setupSubscriptions' as never);
        spyOn(component, 'setupKeyBindings' as never);
        component.ngOnInit();
        expect(gameHttpServiceMock.getGameSnapshotByPin).toHaveBeenCalled();
        expect(component['setupSubscriptions']).toHaveBeenCalledWith(dummyPin);
        expect(component['setupKeyBindings']).toHaveBeenCalled();
    });

    it('should unsubscribe from all subscriptions on destroy', () => {
        component.ngOnDestroy();

        expect(subscriptionServiceMock.clear).toHaveBeenCalledWith(component['uuid']);
    });

    it('should return if disableShortcuts is true', () => {
        component['hasSubmitted'] = true;
        component.handleKeyboardEvent({} as KeyboardEvent);
        expect(keyBindingServiceMock.getExecutor).not.toHaveBeenCalled();
    });

    it('should call executor if disableShortcuts is false and isInTransition is true', () => {
        component['hasSubmitted'] = false;
        component['isInTransition'] = false;
        component['question'].type = QuestionType.QCM;
        component.handleKeyboardEvent({} as KeyboardEvent);
        expect(keyBindingServiceMock.getExecutor).toHaveBeenCalled();
    });

    it('should submitChoices', () => {
        component.submitChoices();
        expect(gameServiceMock.qcmSubmit).toHaveBeenCalled();
    });

    it('should toggleSelectChoice', () => {
        const choice = 1;
        component.toggleSelectChoice(choice);
        expect(gameServiceMock.qcmToggleChoice).toHaveBeenCalled();
        component.selectedChoiceIndexes = [0, 1];
        component.toggleSelectChoice(choice);
        expect(component.selectedChoiceIndexes.length).toBe(1);
    });

    it('should openConfirmationDialog', () => {
        matDialogMock.open.and.returnValue(dialogRefSpy);
        routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
        component.openConfirmationDialog();
        expect(matDialogMock.open).toHaveBeenCalled();
    });

    it('should setupSubscriptions', () => {
        const payload: GameEventPayload<Question> = { pin: '123', data: qcmQuestionStub()[0] };
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.Question } };
        const evaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        spyOn(component, 'submitChoices');
        playerServiceMock.getCurrentPlayer.and.returnValue(lastPlayerEvaluationStub().player);
        component.pin = '123';
        component['setupSubscriptions']('123');
        socketServerMock.emit('nextQuestion', payload);
        socketServerMock.emit('submitChoices', evaluationPayload);
        socketServerMock.emit('timerTick', timerPayload);
        expect(gameServiceMock.onNextQuestion).toHaveBeenCalled();
        expect(gameServiceMock.onQcmSubmit).toHaveBeenCalled();
        expect(timerServiceMock.onTimerTick).toHaveBeenCalled();
    });

    it('should setupKeyBindings', () => {
        keyBindingServiceMock.registerKeyBinding.and.callFake((key, callback) => {
            return of(key).subscribe(callback);
        });
        spyOn(component, 'toggleSelectChoice');
        component['setupKeyBindings']();
        expect(component.toggleSelectChoice).toHaveBeenCalled();
    });

    it('should handle QcmSubmit correctly', () => {
        const qcmEvaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };

        component['setupSubscriptions']('123');
        socketServerMock.emit('submitChoices', qcmEvaluationPayload);
        playerServiceMock.getCurrentPlayer.and.returnValue(firstPlayerStub());
        component.player = firstPlayerStub();

        expect(component['cachedEvaluation']).toEqual(qcmEvaluationPayload.data);
        expect(component.questionIsOver).toBeTrue();
    });

    it('should update remaining time on onTimerTick', () => {
        component.pin = '123';
        spyOn(component, 'submitChoices');
        timerServiceMock.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 0, eventType: TimerEventType.Question };
            callback(payload);
            return of(payload).subscribe(callback);
        });
        component['setupSubscriptions']('123');
        component.hasSubmitted = false;
        expect(component.submitChoices).toHaveBeenCalled();
    });
});
