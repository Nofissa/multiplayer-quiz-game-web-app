import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerService } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Observable, Observer, of } from 'rxjs';
import { io } from 'socket.io-client';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    const stubData = {
        pin: '1234',
        maxDuration: 60,
        remainingTime: 30,
    };

    beforeEach(async () => {
        timerServiceSpy = jasmine.createSpyObj('TimerService', ['onStartTimer', 'onTimerTick']);
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], {
            socketInstance: io(),
        });

        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [
                { provide: TimerService, useValue: timerServiceSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
            ],
        }).compileComponents();

        webSocketServiceSpy = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
        webSocketServiceSpy.on.and.callFake(<T>(eventName: string, func: (data: T) => void) => {
            return new Observable<T>((observer: Observer<T>) => {
                webSocketServiceSpy['socketInstance'].on(eventName, (data) => {
                    observer.next(data);
                });

                return () => {
                    webSocketServiceSpy['socketInstance'].off(eventName);
                };
            }).subscribe(func);
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to onStartTimer and onTimerTick on initialization', () => {
        timerServiceSpy.onStartTimer.and.returnValue(of(stubData.maxDuration).subscribe());
        timerServiceSpy.onTimerTick.and.returnValue(of(stubData.remainingTime).subscribe());
        component.pin = stubData.pin;
        component.ngOnInit();

        expect(timerServiceSpy.onStartTimer).toHaveBeenCalledWith(stubData.pin, jasmine.any(Function));
        expect(timerServiceSpy.onTimerTick).toHaveBeenCalledWith(stubData.pin, jasmine.any(Function));
    });

    it('should update remaining time and maxDuration on onStartTimer', () => {
        component.pin = stubData.pin;

        timerServiceSpy.onStartTimer.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: stubData.maxDuration, eventType: TimerEventType.Question };
            callback(payload);
            return of(payload).subscribe(callback);
        });
        component.ngOnInit();

        expect(component.maxDuration).toEqual(stubData.maxDuration);
        expect(component.remainingTime).toEqual(stubData.maxDuration);
    });

    it('should update remaining time on onTimerTick', () => {
        component.pin = stubData.pin;

        timerServiceSpy.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: stubData.remainingTime, eventType: TimerEventType.Question };
            callback(payload);
            return of(payload).subscribe(callback);
        });
        component.ngOnInit();

        expect(component.remainingTime).toEqual(stubData.remainingTime);
    });

    it('should close subscriptions on ngOnDestroy', () => {
        const payload = { remainingTime: stubData.remainingTime, eventType: TimerEventType.Question };
        timerServiceSpy.onStartTimer.and.callFake(() => {
            const sub = of(payload).subscribe();
            sub.closed = false;
            return sub;
        });
        timerServiceSpy.onTimerTick.and.callFake(() => {
            const sub = of(payload).subscribe();
            sub.closed = false;
            return sub;
        });

        component.pin = stubData.pin;
        component.ngOnInit();
        component.ngOnDestroy();

        expect(component['startTimerSubscription'].closed).toBeTrue();
        expect(component['timerTickSubscription'].closed).toBeTrue();
    });
});
