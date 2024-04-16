import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerService } from '@app/services/timer/timer.service';
import { TimerPauseToggleComponent } from './timer-pause-toggle.component';
import { Observable, Observer, of, Subscription } from 'rxjs';
import { TimerEventType } from '@common/timer-event-type';
import { io } from 'socket.io-client';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { TimerPayload } from '@common/timer-payload';
import { SocketServerMock } from '@app/mocks/socket-server-mock';

describe('TimerPauseToggleComponent', () => {
    let component: TimerPauseToggleComponent;
    let fixture: ComponentFixture<TimerPauseToggleComponent>;
    let timerServiceMock: jasmine.SpyObj<TimerService>;
    let webSocketServiceMock: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;

    beforeEach(async () => {
        timerServiceMock = jasmine.createSpyObj('TimerService', ['togglePauseTimer', 'onStartTimer', 'onTimerTick', 'onTogglePauseTimer']);
        webSocketServiceMock = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], {
            socketInstance: io(),
        });

        TestBed.configureTestingModule({
            declarations: [TimerPauseToggleComponent],
            providers: [
                { provide: TimerService, useValue: timerServiceMock },
                { provide: WebSocketService, useValue: webSocketServiceMock },
            ],
        });

        webSocketServiceMock.on.and.callFake(<T>(eventName: string, func: (data: T) => void) => {
            return new Observable<T>((observer: Observer<T>) => {
                webSocketServiceMock['socketInstance'].on(eventName, (data: T) => {
                    observer.next(data);
                });

                return () => {
                    webSocketServiceMock['socketInstance'].off(eventName);
                };
            }).subscribe(func);
        });

        socketServerMock = new SocketServerMock([webSocketServiceMock['socketInstance']]);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimerPauseToggleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component['subscriptions'] = [];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle pause on button click', () => {
        component.togglePause();

        expect(timerServiceMock.togglePauseTimer).toHaveBeenCalledWith(component.pin);
    });

    it('should subscribe to timer events on initialization', () => {
        const subscribeToTimerEventsSpy = spyOn(component, 'subscribeToTimerEvents' as never).and.stub();

        component.ngOnInit();

        expect(subscribeToTimerEventsSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from all subscriptions on destruction', () => {
        const unsubscribeAllSpy = spyOn(component, 'unsubscribeAll' as never).and.stub();

        component.ngOnDestroy();

        expect(unsubscribeAllSpy).toHaveBeenCalled();
    });

    it('should update isVisible when receiving onStartTimer event', () => {
        component.isVisible = false;

        timerServiceMock.onStartTimer.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { eventType: TimerEventType.Question, remainingTime: 10 };
            callback(payload);

            return of(payload).subscribe(callback);
        });

        component.ngOnInit();
        socketServerMock.emit('startTimer', {} as never);

        expect(component.isVisible).toBe(true);
    });

    it('should update isVisible based on remainingTime when receiving onTimerTick event', () => {
        component.isVisible = false;

        timerServiceMock.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { eventType: TimerEventType.Question, remainingTime: 10 };
            callback(payload);

            return of(payload).subscribe(callback);
        });

        component.ngOnInit();
        socketServerMock.emit('timerTick', {} as never);

        expect(component.isVisible).toBe(true);
    });

    it('should update isRunning when receiving onTogglePauseTimer event', () => {
        timerServiceMock.onTogglePauseTimer.and.callFake((_pin: string, callback: (isRunning: boolean) => void) => {
            const isRunning = false;
            callback(isRunning);

            return of(isRunning).subscribe(callback);
        });

        component.ngOnInit();
        socketServerMock.emit('togglePauseTimer', {} as never);

        expect(component.isRunning).toBe(false);
    });

    it('should update isRunning when receiving onTogglePauseTimer event', () => {
        timerServiceMock.onTogglePauseTimer.and.callFake((_pin: string, callback: (isRunning: boolean) => void) => {
            const isRunning = true;
            callback(isRunning);

            return of(isRunning).subscribe(callback);
        });

        component.ngOnInit();
        socketServerMock.emit('togglePauseTimer', {} as never);

        expect(component.isRunning).toBe(true);
    });

    it('should unsubscribe from all subscriptions when calling unsubscribeAll', () => {
        component['subscriptions'].push(new Subscription(), new Subscription());

        component.ngOnDestroy();

        expect(component['subscriptions'].every((sub) => sub.closed)).toBe(true);
    });
});
