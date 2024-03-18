import { TestBed } from '@angular/core/testing';
import { PlayerService } from '@app/services/player/player.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { io } from 'socket.io-client';

describe('PlayerService', () => {
    let playerService: PlayerService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    const playerMock: Player = {
        socketId: '1234',
        username: 'Bob',
        state: PlayerState.Playing,
        score: 20,
        speedAwardCount: 12,
    };

    // const playerMock2: Player = {
    //     socketId: '1234',
    //     username: 'Bob',
    //     state: PlayerState.Abandonned,
    //     score: 20,
    //     speedAwardCount: 12,
    // };

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on', 'getSocketId'], {
            socketInstance: io(),
        });

        TestBed.configureTestingModule({
            providers: [PlayerService, { provide: WebSocketService, useValue: webSocketServiceSpy }],
        });

        playerService = TestBed.inject(PlayerService);
        webSocketServiceSpy = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
    });

    it('should be created', () => {
        expect(playerService).toBeTruthy();
    });

    it('should add a player to the game', () => {
        const pin = '1234';

        playerService.setPlayer(pin, playerMock);

        const playersInGame = playerService['playersMap'].get(pin);
        expect(playersInGame).toContain(playerMock);
    });

    it('should get current player from the game', () => {
        const pin = '1234';
        const socketId = 'socket1';
        webSocketServiceSpy.getSocketId.and.returnValue(socketId);

        playerService.setPlayer(pin, playerMock);

        const currentPlayer = playerService.getCurrentPlayer(pin);
        expect(currentPlayer).toEqual(playerMock);
    });
});
