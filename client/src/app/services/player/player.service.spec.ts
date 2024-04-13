import { TestBed } from '@angular/core/testing';
import { secondPlayerStub } from '@app/test-stubs/player.stubs';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { GameEventPayload } from '@common/game-event-payload';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { PlayerService } from './player.service';

describe('PlayerService', () => {
    let service: PlayerService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    const stubData = {
        pin1: '1234',
        pin2: '4321',
        createGameEventName: 'createGame',
        startGameEventName: 'startGame',
        playerLeaveEndGameEventName: 'playerLeaveGame',
        endGameEventName: 'endGame',
        joinGameEventName: 'joinGame',
        cancelGameEventName: 'cancelGame',
        playerAbandonEventName: 'playerAbandon',
        playerBanEventName: 'playerBan',
        toggleSelectChoiceEventName: 'qcmToggleChoice',
        submitChoicesEventName: 'qcmSubmit',
        getCurrentQuestionEventName: 'getCurrentQuestion',
        nextQuestionEventName: 'nextQuestion',
        toggleGameLockEventName: 'toggleGameLock',
        playerMuteEventName: 'playerMute',
        callback: jasmine.createSpy('callback'),
    };

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['getSocketId', 'emit', 'on'], {
            socketInstance: io(),
        });

        TestBed.configureTestingModule({
            providers: [{ provide: WebSocketService, useValue: webSocketServiceSpy }],
        });
        service = TestBed.inject(PlayerService);
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
        stubData.callback.calls.reset();
    });

    afterEach(() => {
        service['playersMap'].clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set player', () => {
        const pin = '123';
        const player: Player = {} as Player;

        service.setPlayer(pin, player);

        expect(service.getCurrentPlayer(pin)).toEqual(player);
    });

    it('should return null if no player has been set', () => {
        const pin = '123';

        webSocketServiceSpy.getSocketId.and.returnValue('someSocketId');

        expect(service.getCurrentPlayer(pin)).toBeNull();
    });

    it('should return player if found', () => {
        const pin = '123';
        const someSocketId = 'someSocketId';
        const player: Player = { socketId: someSocketId } as Player;

        service.setPlayer(pin, player);
        webSocketServiceSpy.getSocketId.and.returnValue(someSocketId);

        expect(service.getCurrentPlayer(pin)).toEqual(player);
    });

    it('should raise playerAbandon event', () => {
        service.playerAbandon(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.playerAbandonEventName, { pin: stubData.pin1 });
    });

    it('should subscribe to playerAbandon event and call the callback if pin matches', () => {
        service.onPlayerAbandon(stubData.pin1, stubData.callback);

        const player: Player = secondPlayerStub();
        const payload: GameEventPayload<Player> = { pin: stubData.pin1, data: player };
        socketServerMock.emit(stubData.playerAbandonEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(player);
    });

    it('should subscribe to playerAbandon event and not call the callback if does not match', () => {
        service.onPlayerAbandon(stubData.pin1, stubData.callback);

        const player: Player = secondPlayerStub();
        const payload: GameEventPayload<Player> = { pin: stubData.pin2, data: player };
        socketServerMock.emit(stubData.playerAbandonEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise playerBan event', () => {
        const username = 'user123';
        service.playerBan(stubData.pin1, username);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.playerBanEventName, { pin: stubData.pin1, username });
    });

    it('should subscribe to playerBan event and call the callback if pin matches', () => {
        service.onPlayerBan(stubData.pin1, stubData.callback);

        const player: Player = secondPlayerStub();
        player.state = PlayerState.Banned;
        const payload: GameEventPayload<Player> = { pin: stubData.pin1, data: player };
        socketServerMock.emit('playerBan', payload);

        expect(stubData.callback).toHaveBeenCalledWith(player);
    });

    it('should subscribe to playerBan event and not call the callback if pin does not match', () => {
        service.onPlayerBan(stubData.pin1, stubData.callback);

        const player: Player = secondPlayerStub();
        player.state = PlayerState.Banned;
        const payload: GameEventPayload<Player> = { pin: stubData.pin2, data: player };
        socketServerMock.emit('playerBan', payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise playerMute event', () => {
        const username = 'user123';
        service.playerMute(stubData.pin1, username);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.playerMuteEventName, { pin: stubData.pin1, username });
    });

    it('should subscribe to playerMute event and call the callback if pin matches', () => {
        service.onPlayerMute(stubData.pin1, stubData.callback);

        const player: Player = secondPlayerStub();
        player.state = PlayerState.Banned;
        const payload: GameEventPayload<Player> = { pin: stubData.pin1, data: player };
        socketServerMock.emit('playerMute', payload);

        expect(stubData.callback).toHaveBeenCalledWith(player);
    });

    it('should subscribe to playerMute event and not call the callback if pin does not match', () => {
        service.onPlayerMute(stubData.pin1, stubData.callback);

        const player: Player = secondPlayerStub();
        player.state = PlayerState.Banned;
        const payload: GameEventPayload<Player> = { pin: stubData.pin2, data: player };
        socketServerMock.emit('playerMute', payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });
});
