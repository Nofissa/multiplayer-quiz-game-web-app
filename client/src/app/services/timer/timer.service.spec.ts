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
        togglePauseTimerEventName: 'togglePauseTimer',
        accelerateTimerEvent: 'accelerateTimer',
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
        const eventType: TimerEventType = TimerEventType.StartGame;
        const duration = undefined;
        timerService.startTimer(pin, eventType);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('startTimer', { pin, eventType, duration });
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

    it('should raise stopTimer event', () => {
        const pin = '1234';
        timerService.stopTimer(pin);

        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('stopTimer', { pin });
    });

    it('should raise togglePauseTimer event', () => {
        const pin = '1234';
        timerService.togglePauseTimer(pin);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('togglePauseTimer', { pin });
    });

    it('should subscribe to togglePauseTimer event and not call the callback on server emit if pin does not match', () => {
        timerService.onTogglePauseTimer(stubData.pin1, stubData.callback);

        const payload: GameEventPayload<number> = { pin: stubData.pin2, data: 60 };

        socketServerMock.emit(stubData.togglePauseTimerEventName, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.togglePauseTimerEventName, jasmine.any(Function));
        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should subscribe to togglePauseTimer event and call the callback on server emit if pin matches', () => {
        timerService.onTogglePauseTimer(stubData.pin1, stubData.callback);

        const payload: GameEventPayload<number> = { pin: stubData.pin1, data: 60 };

        socketServerMock.emit(stubData.togglePauseTimerEventName, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.togglePauseTimerEventName, jasmine.any(Function));
        expect(stubData.callback).toHaveBeenCalledWith(payload.data);
    });

    it('should raise accelerateTimer event', () => {
        const pin = '1234';
        const ticksPerSecond = 4;

        timerService.accelerateTimer(pin, ticksPerSecond);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('accelerateTimer', { pin, ticksPerSecond });
    });

    it('should subscribe to accelerateTimer event and not call the callback on server emit if pin does not match', () => {
        timerService.onAccelerateTimer(stubData.pin1, stubData.callback);

        const payload: GameEventPayload<number> = { pin: stubData.pin2, data: 60 };

        socketServerMock.emit(stubData.accelerateTimerEvent, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.accelerateTimerEvent, jasmine.any(Function));
        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should subscribe to accelerateTimer event and call the callback on server emit if pin matches', () => {
        timerService.onAccelerateTimer(stubData.pin1, stubData.callback);

        const payload: GameEventPayload<number> = { pin: stubData.pin1, data: 60 };

        socketServerMock.emit(stubData.accelerateTimerEvent, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.accelerateTimerEvent, jasmine.any(Function));
        expect(stubData.callback).toHaveBeenCalledWith(payload.data);
    });
});
