import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { lastPlayerEvaluationStub } from '@app/TestStubs/evaluation.stubs';
import { firstPlayerStub } from '@app/TestStubs/player.stubs';
import { questionStub } from '@app/TestStubs/question.stubs';
import { quizStub } from '@app/TestStubs/quiz.stubs';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { Evaluation } from '@common/evaluation';
import { GameEventPayload } from '@common/game-event-payload';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Question } from '@common/question';
import { Quiz } from '@common/quiz';
import { Submission } from '@common/submission';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Observable, Subscription, of } from 'rxjs';
import { io } from 'socket.io-client';
import { QRLboardComponent } from './qrlboard.component';

const MAX_MESSAGE_LENGTH = 200;

fdescribe('QrlBoardComponent', () => {
    let component: QRLboardComponent;
    let fixture: ComponentFixture<QRLboardComponent>;
    let mockGameHttpService: jasmine.SpyObj<GameHttpService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockPlayerService: jasmine.SpyObj<PlayerService>;
    let matDialogMock: jasmine.SpyObj<MatDialog>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;
    let routerSpy: jasmine.SpyObj<Router>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    let timerServiceMock: jasmine.SpyObj<TimerService>;

    const mockPlayers: Player[] = [
        {
            socketId: 'socket123',
            username: 'TestUser',
            state: PlayerState.Playing,
            score: 10,
            speedAwardCount: 1,
        },
    ];

    const mockQuiz: Quiz = {
        id: 'quiz1',
        title: 'Test Quiz',
        description: 'A test quiz',
        duration: 30,
        lastModification: new Date(),
        questions: [],
        isHidden: false,
        _id: 'quiz1',
    };

    const mockState: GameState = GameState.Opened;

    const mockQuestionSubmissions: Submission[][] = [[{ choices: [{ index: 0, isSelected: true }], isFinal: false }]];

    const mockGameSnapshot: GameSnapshot = {
        players: mockPlayers,
        chatlogs: [],
        quiz: mockQuiz,
        state: mockState,
        currentQuestionIndex: 0,
        questionSubmissions: mockQuestionSubmissions,
    };

    const observableSnapShot = of(mockGameSnapshot);

    beforeEach(() => {
        mockGameHttpService = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        mockGameService = jasmine.createSpyObj('GameService', [
            'submitChoices',
            'nextQuestion',
            'onNextQuestion',
            'onSubmitChoices',
            'playerAbandon',
        ]);
        mockPlayerService = jasmine.createSpyObj('PlayerService', ['getCurrentPlayer']);
        matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef<ConfirmationDialogComponent>', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], { socketInstance: io() });
        timerServiceMock = jasmine.createSpyObj('TimerService', ['onTimerTick']);

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, RouterTestingModule, MatDialogModule],
            declarations: [QRLboardComponent, ConfirmationDialogComponent],
            providers: [
                { provide: GameHttpService, useValue: mockGameHttpService },
                { provide: GameService, useValue: mockGameService },
                { provide: PlayerService, useValue: mockPlayerService },
                { provide: MatSnackBarModule, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: Router, useValue: routerSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: TimerService, useValue: timerServiceMock },
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
        mockGameService.onSubmitChoices.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('submitChoices', applyIfPinMatches(pin, callback));
        });
        fixture = TestBed.createComponent(QRLboardComponent);
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
        spyOn(component['eventSubscriptions'], 'forEach');
        component.ngOnDestroy();
        expect(component['eventSubscriptions'].forEach).toHaveBeenCalled();
    });

    it('should loadNextQuestion', () => {
        component.questionIsOver = true;
        component['loadNextQuestion'](quizStub().questions[0]);
        expect(component.questionIsOver).toBeFalse();
    });

    it('should openConfirmationDialog', () => {
        matDialogMock.open.and.returnValue(dialogRefSpy);
        routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
        component.openConfirmationDialog();
        expect(matDialogMock.open).toHaveBeenCalled();
    });

    it('should setupSubscriptions', () => {
        const payload: GameEventPayload<Question> = { pin: '123', data: questionStub()[0] };
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.Question } };
        const evaluationPayload: GameEventPayload<Evaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        spyOn(component, 'submitChoices');
        mockPlayerService.getCurrentPlayer.and.returnValue(lastPlayerEvaluationStub().player);
        component.pin = '123';
        component['setupSubscriptions']('123');
        socketServerMock.emit('nextQuestion', payload);
        socketServerMock.emit('submitChoices', evaluationPayload);
        socketServerMock.emit('timerTick', timerPayload);
        expect(mockGameService.onNextQuestion).toHaveBeenCalled();
        expect(mockGameService.onSubmitChoices).toHaveBeenCalled();
        expect(timerServiceMock.onTimerTick).toHaveBeenCalled();
        expect(component.submitAnswer).toHaveBeenCalled();
    });

    it('should send a message and clear input when valid', () => {
        component.input = 'Test message';
        component.submitAnswer();
        expect(mockGameService.submitChoices).toHaveBeenCalledWith('1234');
        expect(component.input).toBe('');
    });

    it('should not send a message if input is only whitespace', () => {
        component.input = '   ';
        component.submitAnswer();
        expect(mockGameService.submitChoices).not.toHaveBeenCalled();
    });

    it('should validate message as invalid if it contains only whitespace', () => {
        const messageControl = component.formGroup.get('message');
        if (messageControl) {
            messageControl.setValue('   ');
            messageControl.updateValueAndValidity();
            expect(messageControl.invalid).toBeTrue();
            expect(messageControl.errors).toEqual({ invalidMessage: true });
        } else {
            fail('Message control does not exist');
        }
    });

    it('should update remaining input count on key down', () => {
        component.input = 'Test';
        const event = new KeyboardEvent('keydown', { key: 'a' });
        const textarea = fixture.nativeElement.querySelector('textarea');
        textarea.dispatchEvent(event);
        expect(component.remainingInputCount).toBe(MAX_MESSAGE_LENGTH - component.input.length);
    });

    it('should unsubscribe from all subscriptions on destroy', () => {
        const mockSub1 = new Subscription();
        const mockSub2 = new Subscription();
        component['eventSubscriptions'].push(mockSub1, mockSub2);
        expect(mockSub1.closed).toBeFalse();
        expect(mockSub2.closed).toBeFalse();
        component.ngOnDestroy();
        expect(mockSub1.closed).toBeTrue();
        expect(mockSub2.closed).toBeTrue();
    });

    it('should add and remove blink class after a delay', fakeAsync(() => {
        const textarea = fixture.nativeElement.querySelector('textarea');
        component.blinkTextArea();

        expect(textarea.classList.contains('blink')).toBe(true);

        const THREE_SECONDS_MS = 3000;
        tick(THREE_SECONDS_MS);

        expect(textarea.classList.contains('blink')).toBe(false);
    }));

    it('should tell if the question is a qrl', () => {
        component.question = questionStub()[0];
        component.question.type = 'QRL';
        let result = component.isQRL();
        expect(result).toBeTruthy();
        component.question.type = 'QCM';
        result = component.isQRL();
        expect(result).toBeFalsy();
    });

    // it('should submit choices and update state', () => {
    //     const sub = new Subscription();
    //     mockPlayerService.getCurrentPlayer.and.returnValue(firstPlayerStub());

    //     // Mock evaluation
    //     const mockEvaluation = { player: firstPlayerStub(), isLast: true, score: 100 }; // Mocked evaluation object
    //     // eslint-disable-next-line @typescript-eslint/ban-types
    //     mockGameService.onSubmitChoices.and.callFake((pin: string, callback: Function) => {
    //         callback(mockEvaluation);
    //         return sub;
    //     });

    //     // Call the method
    //     component.submitChoices();

    //     // Check if submitChoices() updates component state as expected
    //     expect(component.hasSubmitted).toBe(true);
    //     expect(component.cachedEvaluation).toEqual(mockEvaluation);

    //     // Check if GameService's submitChoices() is called with the correct parameters
    //     expect(mockGameService.submitChoices).toHaveBeenCalledWith(component.pin);
    //   });
});
