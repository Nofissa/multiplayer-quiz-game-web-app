/* eslint-disable max-lines */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { QrlBoardComponent } from '@app/components/qrl-board/qrl-board.component';
import { MAX_MESSAGE_LENGTH, NOTICE_DURATION_MS } from '@app/constants/constants';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { TimerService } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { lastPlayerEvaluationStub } from '@app/test-stubs/evaluation.stubs';
import { firstPlayerStub } from '@app/test-stubs/player.stubs';
import { qrlQuestionStub } from '@app/test-stubs/question.stubs';
import { quizStub } from '@app/test-stubs/quiz.stubs';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { GameEventPayload } from '@common/game-event-payload';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { Grade } from '@common/grade';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { Question } from '@common/question';
import { QuestionType } from '@common/question-type';
import { Quiz } from '@common/quiz';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Observable, of } from 'rxjs';
import { io } from 'socket.io-client';

describe('QrlBoardComponent', () => {
    let component: QrlBoardComponent;
    let fixture: ComponentFixture<QrlBoardComponent>;
    let mockGameHttpService: jasmine.SpyObj<GameHttpService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockPlayerService: jasmine.SpyObj<PlayerService>;
    let matDialogMock: jasmine.SpyObj<MatDialog>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;
    let routerSpy: jasmine.SpyObj<Router>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    let timerServiceMock: jasmine.SpyObj<TimerService>;
    let subscriptionServiceMock: jasmine.SpyObj<SubscriptionService>;

    const mockPlayers: Player[] = [
        {
            socketId: 'socket123',
            username: 'TestUser',
            state: PlayerState.Playing,
            score: 10,
            speedAwardCount: 1,
            isTyping: false,
            hasInteracted: false,
            hasSubmitted: false,
            isMuted: false,
        },
    ];

    const mockQuiz: Quiz = {
        id: 'quiz1',
        title: 'Test Quiz',
        description: 'A test quiz',
        duration: 30,
        lastModification: new Date(),
        questions: [qrlQuestionStub()[0]],
        isHidden: false,
        _id: 'quiz1',
    };

    const mockState: GameState = GameState.Opened;

    const mockQuestionSubmissions: QcmSubmission[][] = [[{ clientId: 'Some ID', choices: [{ payload: 1, isSelected: true }], isFinal: true }]];
    const mockQuestionQrlSubmissions: QrlSubmission[][] = [[{ answer: 'hello', clientId: 'playerId' }]];

    const mockGameSnapshot: GameSnapshot = {
        players: mockPlayers,
        chatlogs: [],
        quiz: mockQuiz,
        state: mockState,
        currentQuestionIndex: 0,
        questionQcmSubmissions: mockQuestionSubmissions,
        questionQrlSubmission: mockQuestionQrlSubmissions,
        questionQrlEvaluation: [],
    };

    const observableSnapShot = of(mockGameSnapshot);

    beforeEach(() => {
        mockGameHttpService = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        mockGameService = jasmine.createSpyObj('GameService', [
            'qrlSubmit',
            'nextQuestion',
            'onNextQuestion',
            'onQrlSubmit',
            'onQrlEvaluate',
            'qrlInputChange',
        ]);
        mockPlayerService = jasmine.createSpyObj('PlayerService', ['getCurrentPlayer', 'playerAbandon']);
        matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef<ConfirmationDialogComponent>', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], { socketInstance: io() });
        timerServiceMock = jasmine.createSpyObj('TimerService', ['onTimerTick']);
        subscriptionServiceMock = jasmine.createSpyObj<SubscriptionService>(['add', 'clear']);

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, RouterTestingModule, MatDialogModule, BrowserAnimationsModule],
            declarations: [QrlBoardComponent, ConfirmationDialogComponent],
            providers: [
                { provide: GameHttpService, useValue: mockGameHttpService },
                { provide: GameService, useValue: mockGameService },
                { provide: PlayerService, useValue: mockPlayerService },
                { provide: MatSnackBarModule, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: Router, useValue: routerSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: TimerService, useValue: timerServiceMock },
                { provide: SubscriptionService, useValue: subscriptionServiceMock },
                MatSnackBar,
                FormBuilder,
            ],
        });
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
        mockGameHttpService.getGameSnapshotByPin.and.returnValue(observableSnapShot);
        mockPlayerService.getCurrentPlayer.and.returnValue(firstPlayerStub());
        mockGameService.onNextQuestion.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('nextQuestion', applyIfPinMatches(pin, callback));
        });
        timerServiceMock.onTimerTick.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('timerTick', applyIfPinMatches(pin, callback));
        });
        mockGameService.onQrlSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qrlSubmit', applyIfPinMatches(pin, callback));
        });
        mockGameService.onQrlSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qrlSubmit', applyIfPinMatches(pin, callback));
        });
        mockGameService.onQrlEvaluate.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qrlEvaluate', applyIfPinMatches(pin, callback));
        });
        fixture = TestBed.createComponent(QrlBoardComponent);
        component = fixture.componentInstance;
        component.pin = '1234';
        mockGameHttpService.getGameSnapshotByPin.and.returnValue(of(mockGameSnapshot));
        fixture.detectChanges();
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should ngOnInit', () => {
        const dummyPin = '123';
        component.pin = dummyPin;
        spyOn(component, 'setupSubscriptions' as never);
        component.ngOnInit();
        expect(mockGameHttpService.getGameSnapshotByPin).toHaveBeenCalled();
        expect(component['setupSubscriptions']).toHaveBeenCalledWith(dummyPin);
    });

    it('should ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(subscriptionServiceMock.clear).toHaveBeenCalled();
    });

    it('should loadNextQuestion', () => {
        component['hasSubmitted'] = true;
        component['loadNextQuestion'](quizStub().questions[0]);
        expect(component['hasSubmitted']).toBeFalse();
    });

    it('should openConfirmationDialog', () => {
        matDialogMock.open.and.returnValue(dialogRefSpy);
        routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
        component.openConfirmationDialog();
        expect(matDialogMock.open).toHaveBeenCalled();
    });

    it('should setupSubscriptions', () => {
        const payload: GameEventPayload<Question> = { pin: '123', data: qrlQuestionStub()[0] };
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.Question } };
        const qrlPayload: GameEventPayload<QrlEvaluation> = {
            pin: '123',
            data: { player: firstPlayerStub(), grade: Grade.Good, score: 10, isLast: true },
        };
        const qrlSubmission: GameEventPayload<QrlSubmission> = { pin: '123', data: { answer: 'tesstststs', clientId: 'test' } };
        spyOn(component, 'submitAnswer');
        mockPlayerService.getCurrentPlayer.and.returnValue(lastPlayerEvaluationStub().player);
        component.pin = '123';
        component['setupSubscriptions']('123');
        socketServerMock.emit('nextQuestion', payload);
        socketServerMock.emit('qrlEvaluate', qrlPayload);
        socketServerMock.emit('timerTick', timerPayload);
        socketServerMock.emit('qrlSubmit', qrlSubmission);
        expect(mockGameService.onNextQuestion).toHaveBeenCalled();
        expect(mockGameService.onQrlEvaluate).toHaveBeenCalled();
        expect(mockGameService.onQrlSubmit).toHaveBeenCalled();
        expect(timerServiceMock.onTimerTick).toHaveBeenCalled();
    });

    it('should send a message when valid', () => {
        component.input = 'Test message';
        component.submitAnswer();
        expect(mockGameService.qrlSubmit).toHaveBeenCalledWith('1234', component.input);
    });

    it('should not send a message if input is longer than 200 characters', () => {
        spyOn<unknown>(component, 'openError' as never);
        component.input = 'abc'.repeat(MAX_MESSAGE_LENGTH);
        component.submitAnswer();
        expect(mockGameService.qrlSubmit).not.toHaveBeenCalled();
        expect(component['openError']).toHaveBeenCalledWith('La réponse contient plus de 200 caractères');
    });

    it('should update remaining input count on key down', () => {
        component.input = 'Test';
        const event = new KeyboardEvent('keydown', { key: 'a' });
        const textarea = fixture.nativeElement.querySelector('textarea');
        textarea.dispatchEvent(event);
        expect(component.remainingInputCount).toBe(MAX_MESSAGE_LENGTH - component.input.length);
    });

    it('should unsubscribe from all subscriptions on destroy', () => {
        component.ngOnDestroy();

        expect(subscriptionServiceMock.clear).toHaveBeenCalledWith(component['uuid']);
    });

    it('should add blink-red class for grade 0 and remove it after 3 seconds', (done) => {
        const THREE_SECONDS_MS = 3000;
        component['blinkTextArea'](0);
        expect(component.textarea.nativeElement.classList.contains('blink-red')).toBeTruthy();
        setTimeout(() => {
            expect(component.textarea.nativeElement.classList.contains('blink-red')).toBeFalsy();
            done();
        }, THREE_SECONDS_MS);
    });

    it('should add blink-yellow class for grade GRADE50 and remove it after 3 seconds', (done) => {
        const THREE_SECONDS_MS = 3000;
        const GRADE50 = 50;
        component['blinkTextArea'](GRADE50);
        expect(component.textarea.nativeElement.classList.contains('blink-yellow')).toBeTruthy();
        setTimeout(() => {
            expect(component.textarea.nativeElement.classList.contains('blink-yellow')).toBeFalsy();
            done();
        }, THREE_SECONDS_MS);
    });

    it('should add blink class for grade GRADE100, show notification, and remove classes and notification after 3 seconds', (done) => {
        const THREE_SECONDS_MS = 3000;
        const GRADE100 = 100;
        component['blinkTextArea'](GRADE100);
        expect(component.textarea.nativeElement.classList.contains('blink')).toBeTruthy();
        expect(component.showNotification100).toBeTruthy();
        setTimeout(() => {
            expect(component.textarea.nativeElement.classList.contains('blink')).toBeFalsy();
            expect(component.showNotification100).toBeFalsy();
            done();
        }, THREE_SECONDS_MS);
    });

    it('should tell if the question is a qrl', () => {
        component.question = qrlQuestionStub()[0];
        expect(component.question.type).toEqual(QuestionType.QRL);
    });

    it('should open error snackbar', () => {
        const snackBarSpy = spyOn(TestBed.inject(MatSnackBar), 'open');

        const errorMessage = 'Test error message';

        component['openError'](errorMessage);

        expect(snackBarSpy).toHaveBeenCalledWith(
            errorMessage,
            undefined,
            jasmine.objectContaining({
                verticalPosition: 'top',
                duration: NOTICE_DURATION_MS,
                panelClass: ['error-snackbar'],
            }),
        );
    });

    it('should handle QrlEvaluate correctly', () => {
        const qrlPayload: GameEventPayload<QrlEvaluation> = {
            pin: '123',
            data: { player: firstPlayerStub(), grade: Grade.Good, score: 10, isLast: true },
        };

        // I have to use any to be able to spy on private method blinktextArea, can't use never because I expect a call with a parameter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blinkTextAreaSpy = spyOn<any>(component, 'blinkTextArea');

        component['setupSubscriptions']('123');
        socketServerMock.emit('qrlEvaluate', qrlPayload);

        component['cachedEvaluation'] = qrlPayload.data;
        component.player = firstPlayerStub();
        expect(component['cachedEvaluation']).toEqual(qrlPayload.data);
        expect(component.isInEvaluation).toBeFalse();
        expect(blinkTextAreaSpy).toHaveBeenCalledWith(Grade.Good);
    });

    it('should update remaining time on onTimerTick', () => {
        component.pin = '123';
        spyOn(component, 'submitAnswer');
        timerServiceMock.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 0, eventType: TimerEventType.Question };
            callback(payload);
            return of(payload).subscribe(callback);
        });
        component['setupSubscriptions']('123');
        component.hasSubmitted = false;
        expect(component.submitAnswer).toHaveBeenCalled();
    });

    it('should open error snackbar', () => {
        const snackBarSpy = spyOn(TestBed.inject(MatSnackBar), 'open');

        const errorMessage = 'Test error message';

        component['openError'](errorMessage);

        expect(snackBarSpy).toHaveBeenCalledWith(
            errorMessage,
            undefined,
            jasmine.objectContaining({
                verticalPosition: 'top',
                duration: NOTICE_DURATION_MS,
                panelClass: ['error-snackbar'],
            }),
        );
    });

    it('should handle QrlEvaluate correctly', () => {
        const qrlPayload: GameEventPayload<QrlEvaluation> = {
            pin: '123',
            data: { player: firstPlayerStub(), grade: Grade.Good, score: 10, isLast: true },
        };

        // I have to use any to be able to spy on private method blinktextArea, can't use never because I expect a call with a parameter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blinkTextAreaSpy = spyOn<any>(component, 'blinkTextArea');

        component['setupSubscriptions']('123');
        socketServerMock.emit('qrlEvaluate', qrlPayload);

        component['cachedEvaluation'] = qrlPayload.data;
        component.player = firstPlayerStub();
        expect(component['cachedEvaluation']).toEqual(qrlPayload.data);
        expect(component.isInEvaluation).toBeFalse();
        expect(blinkTextAreaSpy).toHaveBeenCalledWith(Grade.Good);
    });

    it('should update remaining time on onTimerTick', () => {
        component.pin = '123';
        spyOn(component, 'submitAnswer');
        timerServiceMock.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 0, eventType: TimerEventType.Question };
            callback(payload);
            return of(payload).subscribe(callback);
        });
        component['setupSubscriptions']('123');
        component.hasSubmitted = false;
        expect(component.submitAnswer).toHaveBeenCalled();
    });
});
