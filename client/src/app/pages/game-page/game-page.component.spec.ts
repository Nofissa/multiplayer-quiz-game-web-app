import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { lastPlayerEvaluationStub } from '@app/TestStubs/evaluation.stubs';
import { questionStub } from '@app/TestStubs/question.stubs';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { GameEventPayload } from '@common/game-event-payload';
import { Question } from '@common/question';
import { QuestionPayload } from '@common/question-payload';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Observable, throwError } from 'rxjs';
import { io } from 'socket.io-client';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameHttpService: GameHttpService;
    let gameService: GameService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;

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
            'onStartGame',
            'onNextQuestion',
            'onEndGame',
            'onJoinGame',
            'qcmSubmit',
        ]);

        playerServiceSpy = jasmine.createSpyObj<PlayerService>(['onPlayerAbandon', 'onPlayerBan', 'playerBan', 'playerAbandon']);

        timerServiceSpy = jasmine.createSpyObj<TimerService>(['onTimerTick', 'onStartTimer', 'stopTimer', 'startTimer']);
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

        gameServiceSpy.onStartGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('startGame', applyIfPinMatches(pin, callback));
        });

        gameServiceSpy.onNextQuestion.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('nextQuestion', applyIfPinMatches(pin, callback));
        });

        gameServiceSpy.onQcmSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qcmSubmit', applyIfPinMatches(pin, callback));
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

    it('should ngOnIt if error status is 404', () => {
        const errorResponse = new HttpErrorResponse({ status: HttpStatusCode.NotFound });
        spyOn(component, 'setupSubscriptions' as never);
        spyOn(gameHttpService, 'getGameSnapshotByPin').and.returnValue(throwError(() => errorResponse));
        spyOn(component['router'], 'navigateByUrl');
        component.ngOnInit();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should ngOnDestroy', () => {
        spyOn(component['eventSubscriptions'], 'forEach');
        component.ngOnDestroy();
        expect(component['eventSubscriptions'].forEach).toHaveBeenCalled();
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

    it('should handleCancelGame', () => {
        spyOn(component['router'], 'navigate');
        component.handleCancelGame();
        expect(component['router'].navigate).toHaveBeenCalled();
    });

    it('should setupSubscriptions', () => {
        const payload: GameEventPayload<Question> = { pin: '123', data: questionStub()[0] };
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.StartGame } };
        const evaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        const messagePayload: GameEventPayload<string> = { pin: '123', data: 'message' };
        const voidPayload: GameEventPayload<void> = { pin: '123', data: undefined };
        spyOn(component['router'], 'navigate');
        spyOn(component, 'handleCancelGame');
        spyOn(component['router'], 'navigateByUrl');
        component.isTest = true;
        component['setupSubscriptions']('123');
        socketServerMock.emit('cancelGame', messagePayload);
        socketServerMock.emit('endGame', voidPayload);
        socketServerMock.emit('startTimer', timerPayload);
        socketServerMock.emit('startGame', payload);
        socketServerMock.emit('nextQuestion', payload);
        socketServerMock.emit('qcmSubmit', evaluationPayload);
        socketServerMock.emit('timerTick', timerPayload);

        expect(timerServiceSpy.startTimer).toHaveBeenCalled();
        expect(component['router'].navigate).toHaveBeenCalled();
        expect(component.handleCancelGame).toHaveBeenCalled();
        expect(component.isStarting).toBeFalse();
        expect(timerServiceSpy.stopTimer).toHaveBeenCalled();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should setupSubscriptions if eventType is NextQuestion and is last question', () => {
        const questionPayload: QuestionPayload = { question: questionStub()[0], isLast: true };
        const payload: GameEventPayload<QuestionPayload> = { pin: '123', data: questionPayload };
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.NextQuestion } };
        const evaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        const messagePayload: GameEventPayload<string> = { pin: '123', data: 'message' };
        const voidPayload: GameEventPayload<void> = { pin: '123', data: undefined };
        spyOn(component['router'], 'navigate');
        spyOn(component, 'handleCancelGame');
        spyOn(component['router'], 'navigateByUrl');
        component.isTest = true;
        component['setupSubscriptions']('123');
        socketServerMock.emit('cancelGame', messagePayload);
        socketServerMock.emit('endGame', voidPayload);
        socketServerMock.emit('startTimer', timerPayload);
        socketServerMock.emit('startGame', payload);
        socketServerMock.emit('nextQuestion', payload);
        socketServerMock.emit('qcmSubmit', evaluationPayload);
        socketServerMock.emit('timerTick', timerPayload);

        expect(timerServiceSpy.startTimer).toHaveBeenCalled();
        expect(component['router'].navigate).toHaveBeenCalled();
        expect(component.handleCancelGame).toHaveBeenCalled();
        expect(component.isStarting).toBeFalse();
        expect(timerServiceSpy.stopTimer).toHaveBeenCalled();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });

    it('should setupSubscriptions if isTest is false', () => {
        const questionPayload: QuestionPayload = { question: questionStub()[0], isLast: true };
        const payload: GameEventPayload<QuestionPayload> = { pin: '123', data: questionPayload };
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.NextQuestion } };
        const evaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        const messagePayload: GameEventPayload<string> = { pin: '123', data: 'message' };
        const voidPayload: GameEventPayload<void> = { pin: '123', data: undefined };
        spyOn(component['router'], 'navigate');
        spyOn(component, 'handleCancelGame');
        spyOn(component['router'], 'navigateByUrl');
        component.isTest = false;
        component['setupSubscriptions']('123');
        socketServerMock.emit('cancelGame', messagePayload);
        socketServerMock.emit('endGame', voidPayload);
        socketServerMock.emit('startTimer', timerPayload);
        socketServerMock.emit('startGame', payload);
        socketServerMock.emit('nextQuestion', payload);
        socketServerMock.emit('qcmSubmit', evaluationPayload);
        socketServerMock.emit('timerTick', timerPayload);

        expect(component['router'].navigate).toHaveBeenCalled();
        expect(component.handleCancelGame).toHaveBeenCalled();
        expect(component.isStarting).toBeFalse();
        expect(component['router'].navigateByUrl).toHaveBeenCalled();
    });
});
