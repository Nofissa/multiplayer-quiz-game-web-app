import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerListSortingOptions } from '@app/enums/player-list-sorting-options';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { lastPlayerEvaluationStub } from '@app/test-stubs/evaluation.stubs';
import { firstPlayerStub } from '@app/test-stubs/player.stubs';
import { quizStub } from '@app/test-stubs/quiz.stubs';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { GameEventPayload } from '@common/game-event-payload';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Observable, of } from 'rxjs';
import { io } from 'socket.io-client';
import { PlayerListComponent } from './player-list.component';

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

fdescribe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let gameHttpService: GameHttpService;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;

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
            'onQrlEvaluate',
            'onQrlInputChange',
            'onQrlSubmit',
        ]);

        timerServiceSpy = jasmine.createSpyObj<TimerService>(['onTimerTick']);

        playerServiceSpy = jasmine.createSpyObj<PlayerService>([
            'onPlayerAbandon',
            'onPlayerBan',
            'onPlayerAbandon',
            'playerBan',
            'onPlayerMute',
            'playerMute',
        ]);

        await TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, MatMenuModule],
            providers: [
                GameServicesProvider,
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
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
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameHttpService = TestBed.inject(GameHttpService);

        gameServiceSpy.onQcmSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qcmSubmit', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onStartGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('startGame', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onJoinGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('joinGame', applyIfPinMatches(pin, callback));
        });
        playerServiceSpy.onPlayerBan.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('playerBan', applyIfPinMatches(pin, callback));
        });
        playerServiceSpy.onPlayerAbandon.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('playerAbandon', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onQcmSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qcmSubmit', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onQrlEvaluate.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qrlEvaluate', applyIfPinMatches(pin, callback));
        });
        playerServiceSpy.onPlayerMute.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('playerMute', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onNextQuestion.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('nextQuestion', applyIfPinMatches(pin, callback));
        });
        timerServiceSpy.onTimerTick.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('timerTick', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onQcmToggleChoice.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qcmToggleChoice', applyIfPinMatches(pin, callback));
        });
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should retrieve players on initialization', () => {
        const dummyPin = '123';
        const dummySnapshot: GameSnapshot = gameSnapshotStub;
        spyOn(gameHttpService, 'getGameSnapshotByPin').and.returnValue(of(dummySnapshot));

        component.pin = dummyPin;
        component.ngOnInit();

        expect(gameHttpService.getGameSnapshotByPin).toHaveBeenCalledWith(dummyPin);
        expect(component.players).toEqual(dummySnapshot.players);
    });

    it('should destroy subscriptions', () => {
        spyOn(component['eventSubscriptions'], 'forEach');
        component.ngOnDestroy();
        expect(component['eventSubscriptions'].forEach).toHaveBeenCalled();
    });

    it('should ban player', () => {
        const dummyPlayer: Player = firstPlayerStub();
        component.pin = '123';
        component.banPlayer(dummyPlayer);
        expect(playerServiceSpy.playerBan).toHaveBeenCalledWith(component.pin, dummyPlayer.username);
    });

    it('should upsert a player', () => {
        const dummyPlayer: Player = firstPlayerStub();
        component.players = [];
        spyOn(component, 'trySort' as never);
        component['upsertPlayer'](dummyPlayer);
        expect(component.players).toEqual([dummyPlayer]);
        expect(component['trySort']).toHaveBeenCalled();
    });

    it('should not push a player if it already exists', () => {
        const dummyPlayer: Player = firstPlayerStub();
        component.players = [dummyPlayer];
        spyOn(component, 'trySort' as never);
        component['upsertPlayer'](dummyPlayer);
        expect(component.players).toEqual([dummyPlayer]);
        expect(component['trySort']).toHaveBeenCalled();
    });

    it('should sort players', () => {
        component.displayOptions.sorted = true;
        const dummyPlayer1: Player = firstPlayerStub();
        const dummyPlayer2: Player = {
            ...firstPlayerStub(),
            score: 100,
        };
        component.players = [dummyPlayer1, dummyPlayer2];
        component['trySort']();
        expect(component.players).toEqual([dummyPlayer2, dummyPlayer1]);
    });

    it('should handle setting up subscriptions', () => {
        const timerPayload: GameEventPayload<TimerPayload> = { pin: '123', data: { remainingTime: 0, eventType: TimerEventType.Question } };
        const evaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        const playerPayload: GameEventPayload<Player> = { pin: '123', data: firstPlayerStub() };
        const qrlEvaluationPayload: GameEventPayload<QrlEvaluation> = { pin: '123', data: { player: firstPlayerStub(), grade: 0, isLast: false } };
        const qcmevaluationPayload: GameEventPayload<QcmEvaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        spyOn(component, 'upsertPlayer' as never);
        component['setupSubscription']('123');
        socketServerMock.emit('qcmSubmit', evaluationPayload);
        socketServerMock.emit('joinGame', playerPayload);
        socketServerMock.emit('playerBan', playerPayload);
        socketServerMock.emit('playerAbandon', playerPayload);
        socketServerMock.emit('startGame', playerPayload);
        socketServerMock.emit('qcmSubmit', qcmevaluationPayload);
        socketServerMock.emit('qrlEvaluate', qrlEvaluationPayload);
        socketServerMock.emit('playerMute', playerPayload);

        socketServerMock.emit('timerTick', timerPayload);
        expect(component.isTimerFinished).toBeTrue();

        component.players = [firstPlayerStub()];
        socketServerMock.emit('nextQuestion', playerPayload);
        expect(component.isTimerFinished).toBeFalse();
        expect(component.players[0].hasInteracted).toBeFalse();
        expect(component.players[0].hasSubmitted).toBeFalse();

        expect(component['upsertPlayer']).toHaveBeenCalled();
    });

    it('should sort players by options', () => {
        spyOn(component, 'trySort' as never);
        component.sortPlayers(PlayerListSortingOptions.NameAscending);
        expect(component['trySort']).toHaveBeenCalled();
    });

    it('should mute a player', () => {
        const dummyPlayer: Player = firstPlayerStub();
        component.pin = '123';
        component.mutePlayer(dummyPlayer);
        expect(playerServiceSpy.playerMute).toHaveBeenCalledWith(component.pin, dummyPlayer.username);
    });

    it('should sort by name if score is the same', () => {
        component.displayOptions.sorted = true;
        const dummyPlayer1: Player = firstPlayerStub();
        const dummyPlayer2: Player = {
            ...firstPlayerStub(),
            username: 'a',
        };
        component.players = [dummyPlayer1, dummyPlayer2];
        component['trySort']();
        expect(component.players).toEqual([dummyPlayer2, dummyPlayer1]);
    });
    it('should handle sorting options', () => {
        const IMPOSSIBLE_SORTING_OPTION = 1000;
        component.displayOptions.sorted = false;
        component.sortingOptions = PlayerListSortingOptions.NameAscending;
        const dummyPlayer1: Player = firstPlayerStub();
        const dummyPlayer2: Player = {
            ...firstPlayerStub(),
            username: 'a',
            score: 100,
            state: 1,
        };
        component.players = [dummyPlayer1, dummyPlayer2];
        component['trySort']();
        expect(component.players).toEqual([dummyPlayer2, dummyPlayer1]);
        component.sortingOptions = PlayerListSortingOptions.NameDescending;
        component['trySort']();
        expect(component.players).toEqual([dummyPlayer1, dummyPlayer2]);
        component.sortingOptions = PlayerListSortingOptions.ScoreAscending;
        component['trySort']();
        expect(component.players).toEqual([dummyPlayer2, dummyPlayer1]);
        component.sortingOptions = PlayerListSortingOptions.ScoreDescending;
        component['trySort']();
        expect(component.players).toEqual([dummyPlayer1, dummyPlayer2]);
        component.sortingOptions = PlayerListSortingOptions.StatusAscending;
        component['trySort']();
        expect(component.players).toEqual([dummyPlayer1, dummyPlayer2]);
        component.sortingOptions = PlayerListSortingOptions.StatusDescending;
        component['trySort']();
        expect(component.players).toEqual([dummyPlayer2, dummyPlayer1]);
        component.sortingOptions = IMPOSSIBLE_SORTING_OPTION as PlayerListSortingOptions;
        expect(() => component['trySort']()).toThrowError('Invalid sorting option');
    });
});
