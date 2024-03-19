import { TestBed } from '@angular/core/testing';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Player } from '@common/player';
import { PlayerService } from './player.service';

describe('PlayerService', () => {
    let service: PlayerService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['getSocketId']);

        TestBed.configureTestingModule({
            providers: [{ provide: WebSocketService, useValue: webSocketServiceSpy }],
        });
        service = TestBed.inject(PlayerService);
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
});
