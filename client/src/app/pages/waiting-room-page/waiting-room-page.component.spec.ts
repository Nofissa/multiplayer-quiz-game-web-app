import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { GameEventPayload } from '@common/game-event-payload';
import { GameSnapshot } from '@common/game-snapshot';
import { Player } from '@common/player';
import { QuestionPayload } from '@common/question-payload';
import { Observable, of, throwError } from 'rxjs';
import { io } from 'socket.io-client';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
    let mockActivatedRoute: Partial<ActivatedRoute>;
    let mockRouter: Partial<Router>;
    let mockGameHttpService: jasmine.SpyObj<GameHttpService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockPlayerService: jasmine.SpyObj<PlayerService>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;

    beforeEach(() => {
        mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
        mockActivatedRoute = { snapshot: { queryParams: { pin: '123' } } } as never as Partial<ActivatedRoute>;
        mockRouter = { navigateByUrl: jasmine.createSpy('navigateByUrl'), navigate: jasmine.createSpy('navigate') };
        mockGameHttpService = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        mockGameService = jasmine.createSpyObj('GameService', ['onCancelGame', 'onStartGame']);
        mockPlayerService = jasmine.createSpyObj('PlayerService', [
            'getCurrentPlayer',
            'onPlayerBan',
            'onPlayerAbandon',
            'onStartGame',
            'playerAbandon',
        ]);
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['on', 'getSocketId'], {
            socketInstance: io(),
        });

        TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            providers: [
                { provide: MatSnackBar, useValue: mockSnackBar },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
                { provide: GameHttpService, useValue: mockGameHttpService },
                { provide: GameService, useValue: mockGameService },
                { provide: PlayerService, useValue: mockPlayerService },
                { provide: WebSocketService, use: mockWebSocketService },
            ],
        }).compileComponents();

        socketServerMock = new SocketServerMock([mockWebSocketService['socketInstance']]);

        mockWebSocketService.on.and.callFake(<T>(eventName: string, func: (data: T) => void) => {
            return new Observable<T>((observer) => {
                mockWebSocketService['socketInstance'].on(eventName, (data) => {
                    observer.next(data);
                });

                return () => {
                    mockWebSocketService['socketInstance'].off(eventName);
                };
            }).subscribe(func);
        });

        mockGameHttpService.getGameSnapshotByPin.and.returnValue(of({} as GameSnapshot));

        mockGameService.onStartGame.and.callFake((pin, callback) => {
            return mockWebSocketService.on('startGame', applyIfPinMatches(pin, callback));
        });

        mockGameService.onCancelGame.and.callFake((pin, callback) => {
            return mockWebSocketService.on('cancelGame', applyIfPinMatches(pin, callback));
        });

        mockPlayerService.onPlayerBan.and.callFake((pin, callback) => {
            return mockWebSocketService.on('playerBan', applyIfPinMatches(pin, callback));
        });

        mockPlayerService.onPlayerAbandon.and.callFake((pin, callback) => {
            return mockWebSocketService.on('playerAbandon', applyIfPinMatches(pin, callback));
        });

        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the component', () => {
        const pin = '123';
        const mockGameSnapshot = {} as GameSnapshot;
        mockGameHttpService.getGameSnapshotByPin.and.returnValue(of(mockGameSnapshot));

        component.ngOnInit();

        expect(component.pin).toEqual(pin);
        expect(mockGameHttpService.getGameSnapshotByPin).toHaveBeenCalledWith(pin);
    });

    it('should handle error when game not found', () => {
        const errorResponse = new HttpErrorResponse({ status: HttpStatusCode.NotFound });
        mockGameHttpService.getGameSnapshotByPin.and.returnValue(throwError(() => errorResponse));

        component.ngOnInit();

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('should handle player leaving game', () => {
        const pin = '123';
        component.pin = pin;
        component.leaveGame();

        expect(mockPlayerService.playerAbandon).toHaveBeenCalledWith(pin);
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('should handle end game navigation', () => {
        const pin = '123';
        component.pin = pin;
        component.handleEndGame();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['results-page'], { queryParams: { pin } });
    });

    it('should setup event subscriptions', () => {
        component.ngOnInit();

        expect(mockGameService.onCancelGame).toHaveBeenCalled();
        expect(mockPlayerService.onPlayerBan).toHaveBeenCalled();
        expect(mockPlayerService.onPlayerAbandon).toHaveBeenCalled();
        expect(mockGameService.onStartGame).toHaveBeenCalled();
    });

    it('should cancelGame open snack bar and navigate to home', () => {
        const pin = '1234';
        component['setupSubscriptions'](pin);

        const payload: GameEventPayload<string> = { pin, data: 'someMessage' };
        socketServerMock.emit('cancelGame', payload);

        expect(mockSnackBar.open).toHaveBeenCalled();
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('should playerBan open snack bar and navigate to home if banned player is current player', () => {
        const pin = '1234';
        const socketId = 'someSocketId';
        const player = { socketId } as Player;

        mockPlayerService.getCurrentPlayer.and.returnValue(player);
        component['setupSubscriptions'](pin);

        const payload: GameEventPayload<Player> = { pin, data: player };
        socketServerMock.emit('playerBan', payload);

        expect(mockSnackBar.open).toHaveBeenCalled();
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('should playerBan not open snack bar and not navigate to home if banned player is not current player', () => {
        const pin = '1234';
        const socketId = 'someSocketId';
        const player = { socketId } as Player;

        mockPlayerService.getCurrentPlayer.and.returnValue({ socketId: 'notTheSameSocketId' } as Player);
        component['setupSubscriptions'](pin);

        const payload: GameEventPayload<Player> = { pin, data: player };
        socketServerMock.emit('playerBan', payload);

        expect(mockSnackBar.open).not.toHaveBeenCalled();
        expect(mockRouter.navigateByUrl).not.toHaveBeenCalledWith('/home');
    });

    it('should playerAbandon navigate to home if banned player is current player', () => {
        const pin = '1234';
        const socketId = 'someSocketId';
        const player = { socketId } as Player;

        mockPlayerService.getCurrentPlayer.and.returnValue(player);
        component['setupSubscriptions'](pin);

        const payload: GameEventPayload<Player> = { pin, data: player };
        socketServerMock.emit('playerAbandon', payload);

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('should playerAbandon not navigate to home if banned player is not current player', () => {
        const pin = '1234';
        const socketId = 'someSocketId';
        const player = { socketId } as Player;

        mockPlayerService.getCurrentPlayer.and.returnValue({ socketId: 'notTheSameSocketId' } as Player);
        component['setupSubscriptions'](pin);

        const payload: GameEventPayload<Player> = { pin, data: player };
        socketServerMock.emit('playerAbandon', payload);

        expect(mockRouter.navigateByUrl).not.toHaveBeenCalledWith('/home');
    });

    it('should startGame navigate to game with right pin', () => {
        const pin = '1234';
        component['setupSubscriptions'](pin);

        const payload: GameEventPayload<QuestionPayload> = { pin, data: {} as QuestionPayload };
        socketServerMock.emit('startGame', payload);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/game'], { queryParams: { pin } });
    });
});
