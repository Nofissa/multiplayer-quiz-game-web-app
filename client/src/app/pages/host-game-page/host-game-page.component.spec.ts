/* eslint-disable max-lines */
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { barChartDataStub } from '@app/TestStubs/bar-chart-data.stubs';
import { firstPlayerEvaluationStub, lastPlayerEvaluationStub } from '@app/TestStubs/evaluation.stubs';
import { secondPlayerStub } from '@app/TestStubs/player.stubs';
import { qcmQuestionStub } from '@app/TestStubs/question.stubs';
import { mockSnapshotStubs } from '@app/TestStubs/snapshot.stubs';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { MessageService } from '@app/services/message/message.service';
import { PlayerService } from '@app/services/player/player.service';
import { SoundService } from '@app/services/sound/sound.service';
import { TimerService } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { BarchartSubmission } from '@common/barchart-submission';
import { GameEventPayload } from '@common/game-event-payload';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { Question } from '@common/question';
import { QuestionPayload } from '@common/question-payload';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Observable, of, throwError } from 'rxjs';
import { io } from 'socket.io-client';
import { HostGamePageComponent } from './host-game-page.component';
import SpyObj = jasmine.SpyObj;

const PIN = '1234';
const NEXT_QUESTION_DELAY = 5;

describe('HostGamePageComponent', () => {
    let component: HostGamePageComponent;
    let fixture: ComponentFixture<HostGamePageComponent>;
    let gameServiceSpy: SpyObj<GameService>;
    let gameHttpServiceSpy: SpyObj<GameHttpService>;
    let timerServiceSpy: SpyObj<TimerService>;
    let soundServiceSpy: SpyObj<SoundService>;
    let gameServicesProviderSpy: SpyObj<GameServicesProvider>;
    let barChartServiceSpy: SpyObj<BarChartService>;
    let routerSpy: SpyObj<Router>;
    let webSocketServiceSpy: SpyObj<WebSocketService>;
    let playerServiceSpy: SpyObj<PlayerService>;
    let socketServerMock: SocketServerMock;

    const clearGameServiceSpies = () => {
        (Object.keys(gameServiceSpy) as (keyof typeof gameServiceSpy)[]).forEach((method) => {
            gameServiceSpy[method].calls.reset();
        });
        (Object.keys(timerServiceSpy) as (keyof typeof timerServiceSpy)[]).forEach((method) => {
            timerServiceSpy[method].calls.reset();
        });
    };

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], {
            socketInstance: io(),
        });
        barChartServiceSpy = jasmine.createSpyObj<BarChartService>([
            'addChart',
            'updateChartData',
            'getAllBarChart',
            'getCurrentQuestionData',
            'setData',
            'flushData',
        ]);
        playerServiceSpy = jasmine.createSpyObj<PlayerService>(['onPlayerAbandon']);
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
            'onQrlEvaluate',
            'onQrlSubmit',
            'onQrlInputChange',
        ]);
        gameServiceSpy.onToggleGameLock.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('toggleGameLock', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onQcmToggleChoice.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('toggleSelectChoice', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onQcmSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('submitChoices', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onStartGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('startGame', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onNextQuestion.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('nextQuestion', applyIfPinMatches(pin, callback));
        });
        playerServiceSpy.onPlayerAbandon.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('playerAbandon', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onEndGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('endGame', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onCancelGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('cancelGame', applyIfPinMatches(pin, callback));
        });
        gameHttpServiceSpy = jasmine.createSpyObj<GameHttpService>(['getGameSnapshotByPin']);
        gameHttpServiceSpy.getGameSnapshotByPin.and.callFake(() => {
            return of(mockSnapshotStubs()[1]);
        });
        timerServiceSpy = jasmine.createSpyObj<TimerService>(['onStartTimer', 'onTimerTick', 'startTimer', 'stopTimer', 'onAccelerateTimer']);
        timerServiceSpy.onTimerTick.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('timerTick', applyIfPinMatches(pin, callback));
        });
        soundServiceSpy = jasmine.createSpyObj<SoundService>(['loadSound', 'playSound', 'stopSound']);

        gameServicesProviderSpy = new GameServicesProvider(
            gameHttpServiceSpy,
            gameServiceSpy,
            timerServiceSpy,
            {} as MessageService, // Mock MessageService
            playerServiceSpy, // Mock PlayerService
            {} as KeyBindingService, // Mock KeyBindingService
            soundServiceSpy,
        );

        routerSpy = jasmine.createSpyObj<Router>(['navigate']);
        routerSpy.navigate.and.stub();

        TestBed.configureTestingModule({
            declarations: [HostGamePageComponent],
            providers: [
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: GameServicesProvider, useValue: gameServicesProviderSpy },
                MatSnackBar,
                { provide: BarChartService, useValue: barChartServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            queryParams: {
                                pin: PIN,
                            },
                        },
                    },
                },
            ],
            imports: [RouterTestingModule, HttpClientTestingModule, BrowserAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(HostGamePageComponent);
        webSocketServiceSpy = TestBed.inject(WebSocketService) as SpyObj<WebSocketService>;
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
        component = fixture.componentInstance;
        fixture.detectChanges();

        clearGameServiceSpies();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should component be initialized correctly', () => {
        expect(component.gameState).toEqual(GameState.Opened);
        expect(component.currentQuestionHasEnded).toEqual(false);
        expect(component.isLastQuestion).toEqual(false);
        expect(component.question).toEqual(undefined);
        expect(component.nextAvailable).toEqual(false);
    });

    it('should barCharts return all chartData if there is data in the service', () => {
        barChartServiceSpy.getAllBarChart.and.returnValue(barChartDataStub());
        const response = component.barCharts;
        expect(barChartServiceSpy.getAllBarChart).toHaveBeenCalled();
        expect(response).toEqual(barChartDataStub());
    });

    it('should barCharts return empty array if there is no data in the service', () => {
        barChartServiceSpy.getAllBarChart.and.returnValue([]);
        const response = component.barCharts;
        expect(barChartServiceSpy.getAllBarChart).toHaveBeenCalled();
        expect(response).toEqual([]);
    });

    it('should barChart get the current question data if there is data is in the service', () => {
        barChartServiceSpy.getCurrentQuestionData.and.returnValue(barChartDataStub()[0]);
        const response = component.barChart;
        expect(barChartServiceSpy.getCurrentQuestionData).toHaveBeenCalled();
        expect(response).toEqual(barChartDataStub()[0]);
    });

    it('should barChart get undefined if there is no data is in the service', () => {
        barChartServiceSpy.getCurrentQuestionData.and.returnValue(undefined);
        const response = component.barChart;
        expect(barChartServiceSpy.getCurrentQuestionData).toHaveBeenCalled();
        expect(response).toEqual(undefined);
    });

    it('should setUpSubscriptions call all needed gameService setUp methods with related callbacks', () => {
        component.ngOnInit();
        expect(gameServiceSpy.onStartGame).toHaveBeenCalledWith(PIN, jasmine.any(Function));
        expect(gameServiceSpy.onCancelGame).toHaveBeenCalledWith(PIN, jasmine.any(Function));
        expect(gameServiceSpy.onToggleGameLock).toHaveBeenCalledWith(PIN, jasmine.any(Function));
        expect(gameServiceSpy.onQcmToggleChoice).toHaveBeenCalledWith(PIN, jasmine.any(Function));
        expect(gameServiceSpy.onQcmSubmit).toHaveBeenCalledWith(PIN, jasmine.any(Function));
        expect(gameServiceSpy.onNextQuestion).toHaveBeenCalledWith(PIN, jasmine.any(Function));
        expect(playerServiceSpy.onPlayerAbandon).toHaveBeenCalledWith(PIN, jasmine.any(Function));
        expect(gameServiceSpy.onEndGame).toHaveBeenCalledWith(PIN, jasmine.any(Function));
        expect(timerServiceSpy.onTimerTick).toHaveBeenCalledWith(PIN, jasmine.any(Function));
    });

    it('should error in NgOnIgnit redirect to home page', () => {
        gameHttpServiceSpy.getGameSnapshotByPin.and.returnValue(throwError(() => new HttpErrorResponse({ status: HttpStatusCode.NotFound })));
        component.ngOnInit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['home']);
    });

    it('should toggleLock call toggleGameLock and change local gameState', () => {
        component.toggleLock();
        const payload: GameEventPayload<GameState> = { pin: PIN, data: GameState.Closed };
        socketServerMock.emit('toggleGameLock', payload);
        expect(component.gameState).toEqual(GameState.Closed);
    });

    it('should startGame start server Game', () => {
        component.startGame();
        const payload: GameEventPayload<QuestionPayload> = { pin: PIN, data: { question: qcmQuestionStub()[0], isLast: false } };
        socketServerMock.emit('startGame', payload);
        expect(component.gameState).toEqual(GameState.Running);
        expect(component.isLastQuestion).toBeFalse();
        expect(barChartServiceSpy.addChart).toHaveBeenCalled();
        expect(timerServiceSpy.startTimer).toHaveBeenCalledWith(PIN, TimerEventType.StartGame, NEXT_QUESTION_DELAY);
    });

    it('should nextQuestion send nextQuestion signal to server and change gameState and set currentQuestionHasEnded', () => {
        component.nextQuestion();
        expect(gameServiceSpy.nextQuestion).toHaveBeenCalledWith(PIN);
        const payload: GameEventPayload<Question> = { pin: PIN, data: qcmQuestionStub()[0] };
        socketServerMock.emit('nextQuestion', payload);
        expect(barChartServiceSpy.addChart).toHaveBeenCalled();
        expect(timerServiceSpy.startTimer).toHaveBeenCalled();
    });

    it('should cancelGame cancel game server side', () => {
        component.cancelGame();
        expect(gameServiceSpy.cancelGame).toHaveBeenCalledWith(PIN);
        const payload: GameEventPayload<string> = { pin: PIN, data: 'Un message' };
        socketServerMock.emit('cancelGame', payload);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['home']);
    });

    it('should endGame end game server side', () => {
        component.endGame();
        expect(gameServiceSpy.endGame).toHaveBeenCalledWith(PIN);
        const payload: GameEventPayload<null> = { pin: PIN, data: null };
        socketServerMock.emit('endGame', payload);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['results'], { queryParams: { pin: PIN } });
    });

    it('should the server emitting toggleSelectChoice affect the barChartData', () => {
        const payload: GameEventPayload<BarchartSubmission> = { pin: PIN, data: undefined as unknown as BarchartSubmission };
        socketServerMock.emit('toggleSelectChoice', payload);
        expect(barChartServiceSpy.updateChartData).toHaveBeenCalledWith(payload.data);
    });

    it('should the server emitting submitChoices do nothing if not last player, or set currentQuestionHasEnded to true', () => {
        let payload: GameEventPayload<QcmEvaluation> = { pin: PIN, data: firstPlayerEvaluationStub() };
        socketServerMock.emit('submitChoices', payload);
        expect(component.currentQuestionHasEnded).toBeFalse();
        payload = { pin: PIN, data: lastPlayerEvaluationStub() };
        socketServerMock.emit('submitChoices', payload);
        expect(component.currentQuestionHasEnded).toBeTrue();
        expect(timerServiceSpy.stopTimer).toHaveBeenCalled();
    });

    it('should playerAbandon should cancelGame if no players are left, do nothing otherwise', () => {
        component.gameState = GameState.Running;
        const payload: GameEventPayload<Player> = { pin: PIN, data: secondPlayerStub() };
        gameHttpServiceSpy.getGameSnapshotByPin.and.callFake(() => {
            return of(mockSnapshotStubs()[0]);
        });
        socketServerMock.emit('playerAbandon', payload);
        expect(gameServiceSpy.cancelGame).toHaveBeenCalled();
        gameServiceSpy.cancelGame.calls.reset();
        gameHttpServiceSpy.getGameSnapshotByPin.and.callFake(() => {
            return of(mockSnapshotStubs()[1]);
        });
        socketServerMock.emit('playerAbandon', payload);
        expect(gameServiceSpy.cancelGame).not.toHaveBeenCalled();
    });

    it('should onTimerTick start timer when ', () => {
        component.gameState = GameState.Running;
        const payload: GameEventPayload<TimerPayload> = { pin: PIN, data: { remainingTime: 0, eventType: TimerEventType.NextQuestion } };

        socketServerMock.emit('timerTick', payload);
        expect(timerServiceSpy.startTimer).toHaveBeenCalled();
    });

    it('should initialize pin from ActivatedRoute', () => {
        expect(component.pin).toEqual(PIN);
    });

    it('should set isEnded return true if Game is ended, false otherwise', () => {
        expect(component.isEnded()).toBeFalse();
        component.gameState = GameState.Ended;
        expect(component.isEnded()).toBeTrue();
    });

    it('should set isLocked return false if game is Openned, false otherwise', () => {
        expect(component.isLocked()).toBeFalse();
        component.gameState = GameState.Running;
        expect(component.isLocked()).toBeTrue();
    });
});
