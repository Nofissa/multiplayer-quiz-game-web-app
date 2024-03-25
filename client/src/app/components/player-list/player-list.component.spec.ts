import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { lastPlayerEvaluationStub } from '@app/TestStubs/evaluation.stubs';
import { firstPlayerStub } from '@app/TestStubs/player.stubs';
import { quizStub } from '@app/TestStubs/quiz.stubs';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { Evaluation } from '@common/evaluation';
import { GameEventPayload } from '@common/game-event-payload';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { Observable, of } from 'rxjs';
import { io } from 'socket.io-client';
import { PlayerListComponent } from './player-list.component';

const gameSnapshotStub: GameSnapshot = {
    players: [],
    chatlogs: [],
    quiz: quizStub(),
    state: GameState.Paused,
    currentQuestionIndex: 0,
    questionSubmissions: [],
};

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let gameHttpService: GameHttpService;
    let gameService: GameService;
    // let playerService: PlayerService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

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
            'onPlayerAbandon',
            'onEndGame',
            'onJoinGame',
            'onPlayerBan',
            'onPlayerAbandon',
            'playerBan',
            'qcmSubmit',
        ]);
        await TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                GameServicesProvider,
                PlayerService,
                MatSnackBar,
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
        gameService = TestBed.inject(GameService);
        // playerService = TestBed.inject(PlayerService);
        gameServiceSpy.onQcmSubmit.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('qcmSubmit', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onStartGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('startGame', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onJoinGame.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('joinGame', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onPlayerBan.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('playerBan', applyIfPinMatches(pin, callback));
        });
        gameServiceSpy.onPlayerAbandon.and.callFake((pin, callback) => {
            return webSocketServiceSpy.on('playerAbandon', applyIfPinMatches(pin, callback));
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
        expect(gameService.playerBan).toHaveBeenCalledWith(component.pin, dummyPlayer.username);
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
            username: 'a',
        };
        component.players = [dummyPlayer1, dummyPlayer2];
        component['trySort']();
        expect(component.players).toEqual([dummyPlayer2, dummyPlayer1]);
    });

    it('should handle setting up subscriptions', () => {
        const evaluationPayload: GameEventPayload<Evaluation> = { pin: '123', data: lastPlayerEvaluationStub() };
        const playerPayload: GameEventPayload<Player> = { pin: '123', data: firstPlayerStub() };
        spyOn(component, 'upsertPlayer' as never);
        component['setupSubscription']('123');
        socketServerMock.emit('qcmSubmit', evaluationPayload);
        socketServerMock.emit('joinGame', playerPayload);
        socketServerMock.emit('playerBan', playerPayload);
        socketServerMock.emit('playerAbandon', playerPayload);
        socketServerMock.emit('startGame', playerPayload);
        expect(component['upsertPlayer']).toHaveBeenCalled();
    });
});
