import { TestBed } from '@angular/core/testing';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { GameEventPayload } from '@common/game-event-payload';
import { TimerEventType } from '@common/timer-event-type';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let timerService: TimerService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    const stubData = {
        pin1: '1234',
        pin2: '4321',
        callback: jasmine.createSpy('callback'),
        startTimerEventName: 'startTimer',
        timerTickEventName: 'timerTick',
    };

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], {
            socketInstance: io(),
        });

        TestBed.configureTestingModule({
            providers: [TimerService, { provide: WebSocketService, useValue: webSocketServiceSpy }],
        });

        timerService = TestBed.inject(TimerService);
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

    it('should be created', () => {
        expect(timerService).toBeTruthy();
    });

    it('should raise startTimer event', () => {
        const pin = '1234';
        timerService.startTimer(pin, TimerEventType.StartGame);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('startTimer', { pin });
    });

    it('should subscribe to startTimer event and call the callback on server emit if pin matches', () => {
        timerService.onStartTimer(stubData.pin1, stubData.callback);

        const payload: GameEventPayload<number> = { pin: stubData.pin1, data: 60 };

        socketServerMock.emit(stubData.startTimerEventName, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.startTimerEventName, jasmine.any(Function));
        expect(stubData.callback).toHaveBeenCalledWith(payload.data);
    });

    it('should subscribe to startTimer event and not call the callback on server emit if pin does not match', () => {
        timerService.onStartTimer(stubData.pin1, stubData.callback);

        const payload: GameEventPayload<number> = { pin: stubData.pin2, data: 60 };

        socketServerMock.emit(stubData.startTimerEventName, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.startTimerEventName, jasmine.any(Function));
        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should subscribe to timerTick event and call the callback on server emit if pin matches', () => {
        timerService.onTimerTick(stubData.pin1, stubData.callback);

        const payload: GameEventPayload<number> = { pin: stubData.pin1, data: 60 };

        socketServerMock.emit(stubData.timerTickEventName, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.timerTickEventName, jasmine.any(Function));
        expect(stubData.callback).toHaveBeenCalledWith(payload.data);
    });

    it('should subscribe to timerTick event and not call the callback on server emit if pin does not match', () => {
        timerService.onTimerTick(stubData.pin1, stubData.callback);

        const payload: GameEventPayload<number> = { pin: stubData.pin2, data: 60 };

        socketServerMock.emit(stubData.timerTickEventName, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.timerTickEventName, jasmine.any(Function));
        expect(stubData.callback).not.toHaveBeenCalled();
    });
});
