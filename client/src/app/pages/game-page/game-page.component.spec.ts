import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { SoundService } from '@app/services/sound/sound.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { TimerService } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { lastPlayerEvaluationStub } from '@app/test-stubs/evaluation.stubs';
import { firstPlayerStub } from '@app/test-stubs/player.stubs';
import { qcmQuestionStub } from '@app/test-stubs/question.stubs';
import { mockSnapshotStubs } from '@app/test-stubs/snapshot.stubs';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { GameEventPayload } from '@common/game-event-payload';
import { GameState } from '@common/game-state';
import { Grade } from '@common/grade';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { Question } from '@common/question';
import { QuestionPayload } from '@common/question-payload';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Observable, of, throwError } from 'rxjs';
import { io } from 'socket.io-client';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameHttpService: GameHttpService;
    let gameService: GameService;
    let socketServerMock: SocketServerMock;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;
    let mockSubscriptionService: jasmine.SpyObj<SubscriptionService>;

    beforeEach(async () => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], {
            socketInstance: io(),
        });
        gameServiceSpy = jasmine.createSpyObj<GameService>([
            'startGame',
            'toggleGameLock',
            'nextQuestion',
            'cancelGame',
            'endGame',
            'onCancelGame',
            'onQcmToggleChoice',
            'onToggleGameLock',
            'onQcmSubmit',
            'onQrlSubmit',
            'onStartGame',
            'onNextQuestion',
            'onEndGame',
            'onJoinGame',
            'qcmSubmit',
        ]);
        playerServiceSpy = jasmine.createSpyObj<PlayerService>(['onPlayerAbandon', 'onPlayerBan', 'playerBan', 'playerAbandon']);
        timerServiceSpy = jasmine.createSpyObj<TimerService>([
            'onStartTimer',
            'onTimerTick',
            'startTimer',
            'stopTimer',
            'onAccelerateTimer',
            'onTogglePauseTimer',
        ]);
        soundServiceSpy = jasmine.createSpyObj('SoundService', ['loadSound', 'playSound', 'stopSound']);
        mockSubscriptionService = jasmine.createSpyObj<SubscriptionService>(['add', 'clear']);

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
            providers: [
                GameServicesProvider,
                { provide: PlayerService, useValue: playerServiceSpy },
                MatSnackBar,
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: TimerService, useValue: timerServiceSpy },
                { provide: SoundService, useValue: soundServiceSpy },
                { provide: SubscriptionService, useValue: mockSubscriptionService },
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

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        gameHttpService = TestBed.inject(GameHttpService);
        gameService = TestBed.inject(GameService);
        fixture.detectChanges();

        gameServiceSpy.onCancelGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('cancelGame', applyIfPinMatches(pin, callback));
        });

        gameServiceSpy.onEndGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('endGame', applyIfPinMatches(pin, callback));
        });

        timerServiceSpy.onTimerTick.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('timerTick', applyIfPinMatches(pin, callback));
        });

        timerServiceSpy.onStartTimer.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('startTimer', applyIfPinMatches(pin, callback));
        });

        timerServiceSpy.onAccelerateTimer.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('accelerateTimer', applyIfPinMatches(pin, callback));
        });
        timerServiceSpy.onTogglePauseTimer.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('togglePauseTimer', applyIfPinMatches(pin, callback));
        });

        gameServiceSpy.onStartGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('startGame', applyIfPinMatches(pin, callback));
        });

        gameServiceSpy.onNextQuestion.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('nextQuestion', applyIfPinMatches(pin, callback));
        });

        gameServiceSpy.onQcmSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qcmSubmit', applyIfPinMatches(pin, callback));
        });

        gameServiceSpy.onQrlSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qrlSubmit', applyIfPinMatches(pin, callback));
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should ngOnIt', () => {
        spyOn(component, 'setupSubscriptions' as never);
        spyOn(gameHttpService, 'getGameSnapshotByPin').and.returnValue(new Observable());
        component.ngOnInit();
        expect(component['setupSubscriptions']).toHaveBeenCalled();
    });

    it('should ngOnIt redirect to home is game is Ended', () => {
        spyOn(component['router'], 'navigateByUrl');
        const snapshot = mockSnapshotStubs()[0];
        snapshot.state = GameState.Ended;
        spyOn(gameHttpService, 'getGameSnapshotByPin').and.returnValue(of(snapshot));
        component.ngOnInit();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should ngOnIt if error status is 404', () => {
        const errorResponse = new HttpErrorResponse({ status: HttpStatusCode.NotFound });
        spyOn(component, 'setupSubscriptions' as never);
        spyOn(gameHttpService, 'getGameSnapshotByPin').and.returnValue(throwError(() => errorResponse));
        spyOn(component['router'], 'navigateByUrl');
        component.ngOnInit();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should unsubscribe clear subscriptions on destroy', () => {
        component.ngOnDestroy();

        expect(mockSubscriptionService.clear).toHaveBeenCalledWith(component['uuid']);
    });

    it('should startGame', () => {
        component.startGame();
        expect(gameService.startGame).toHaveBeenCalled();
    });

    it('should nextQuestion', () => {
        component.nextQuestion();
        expect(gameService.nextQuestion).toHaveBeenCalled();
    });

    it('should endGame', () => {
        component.endGame();
        expect(gameService.endGame).toHaveBeenCalled();
    });

    it('should setupSubscriptions if isTest is true', () => {
        const startPayload: GameEventPayload<Question> = { pin: '123', data: qcmQuestionStub()[0] };
        const nextQuestionPayload: GameEventPayload<QuestionPayload> = { pin: '123', data: { isLast: true, question: qcmQuestionStub()[0] } };
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.StartGame } };
        const evaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        const qrlEvaluationPayload: GameEventPayload<QrlEvaluation> = {
            pin: '123',
            data: { player: firstPlayerStub(), grade: Grade.Good, score: 5, isLast: true },
        };
        const messagePayload: GameEventPayload<string> = { pin: '123', data: 'message' };
        const voidPayload: GameEventPayload<void> = { pin: '123', data: undefined };
        spyOn(component['router'], 'navigateByUrl');
        component.isTest = true;
        fixture.detectChanges();
        component['setupSubscriptions']('123');
        socketServerMock.emit('cancelGame', messagePayload);
        socketServerMock.emit('endGame', voidPayload);
        socketServerMock.emit('startTimer', timerPayload);
        socketServerMock.emit('startGame', startPayload);
        socketServerMock.emit('nextQuestion', nextQuestionPayload);
        socketServerMock.emit('qcmSubmit', evaluationPayload);
        socketServerMock.emit('qrlSubmit', qrlEvaluationPayload);
        socketServerMock.emit('timerTick', timerPayload);

        expect(timerServiceSpy.startTimer).toHaveBeenCalled();
        expect(component.isStarting).toBeFalse();
        expect(timerServiceSpy.stopTimer).toHaveBeenCalled();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should setupSubscriptions if eventType is NextQuestion and is last question', () => {
        const questionPayload: QuestionPayload = { question: qcmQuestionStub()[0], isLast: true };
        const payload: GameEventPayload<QuestionPayload> = { pin: '123', data: questionPayload };
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.NextQuestion } };
        const evaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        const messagePayload: GameEventPayload<string> = { pin: '123', data: 'message' };
        const voidPayload: GameEventPayload<void> = { pin: '123', data: undefined };
        spyOn(component['router'], 'navigateByUrl');
        component.isTest = true;
        fixture.detectChanges();
        component['setupSubscriptions']('123');
        socketServerMock.emit('cancelGame', messagePayload);
        socketServerMock.emit('endGame', voidPayload);
        socketServerMock.emit('startTimer', timerPayload);
        socketServerMock.emit('startGame', payload);
        socketServerMock.emit('nextQuestion', payload);
        socketServerMock.emit('qcmSubmit', evaluationPayload);
        socketServerMock.emit('timerTick', timerPayload);

        expect(timerServiceSpy.startTimer).toHaveBeenCalled();
        expect(component.isStarting).toBeFalse();
        expect(timerServiceSpy.stopTimer).toHaveBeenCalled();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should setupSubscriptions if isTest is false', () => {
        const questionPayload: QuestionPayload = { question: qcmQuestionStub()[0], isLast: true };
        const payload: GameEventPayload<QuestionPayload> = { pin: '123', data: questionPayload };
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.NextQuestion } };
        const evaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        const messagePayload: GameEventPayload<string> = { pin: '123', data: 'message' };
        const voidPayload: GameEventPayload<void> = { pin: '123', data: undefined };
        spyOn(component['router'], 'navigateByUrl');
        component.isTest = false;
        fixture.detectChanges();
        component['setupSubscriptions']('123');
        socketServerMock.emit('cancelGame', messagePayload);
        socketServerMock.emit('endGame', voidPayload);
        socketServerMock.emit('startTimer', timerPayload);
        socketServerMock.emit('startGame', payload);
        socketServerMock.emit('nextQuestion', payload);
        socketServerMock.emit('qcmSubmit', evaluationPayload);
        socketServerMock.emit('timerTick', timerPayload);

        expect(component.isStarting).toBeFalse();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should accelerate Timer load panic sound ', () => {
        component['setupTimerSubscriptions']('1234');
        const payload: GameEventPayload<null> = { pin: '1234', data: null };
        socketServerMock.emit('accelerateTimer', payload);
        expect(soundServiceSpy.loadSound).toHaveBeenCalled();
        expect(soundServiceSpy.playSound).toHaveBeenCalled();
    });

    it('should onTogglePauseTimer play sound ', () => {
        component['setupTimerSubscriptions']('1234');
        let payload: GameEventPayload<boolean> = { pin: '1234', data: true };
        socketServerMock.emit('togglePauseTimer', payload);
        expect(soundServiceSpy.playSound).toHaveBeenCalled();
        payload = { pin: '1234', data: false };
        socketServerMock.emit('togglePauseTimer', payload);
        expect(soundServiceSpy.stopSound).toHaveBeenCalled();
    });
});
