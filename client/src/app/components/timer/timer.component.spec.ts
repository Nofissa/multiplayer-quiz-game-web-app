import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerComponent } from './timer.component';
import { TimerService } from '@app/services/timer/timer.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { io } from 'socket.io-client';
import { Observable, Observer, of } from 'rxjs';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    const stubData = {
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
            providers: [TimerService, { provide: WebSocketService, useValue: webSocketServiceSpy }],
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
        const pin = '1234';
        timerServiceSpy.onStartTimer.and.returnValue(of(stubData.maxDuration).subscribe());
        timerServiceSpy.onTimerTick.and.returnValue(of(stubData.remainingTime).subscribe());
        component.pin = pin;
        component.ngOnInit();

        expect(timerServiceSpy.onStartTimer).toHaveBeenCalledWith(pin, jasmine.any(Function));
        expect(timerServiceSpy.onTimerTick).toHaveBeenCalledWith(pin, jasmine.any(Function));
    });

    it('should update remaining time on onTimerTick', () => {
        const pin = '1234';
        const expectedStrokeDashoffset = (stubData.maxDuration - stubData.remainingTime) / stubData.maxDuration;

        timerServiceSpy.onTimerTick.and.callThrough();

        component.pin = pin;
        component.ngOnInit();

        expect(component.remainingTime).toEqual(stubData.remainingTime);
        expect(component.strokeDashoffset).toEqual(expectedStrokeDashoffset);
    });

    it('should close subscriptions on ngOnDestroy', () => {
        const pin = '1234';
        timerServiceSpy.onStartTimer.and.returnValue(of(stubData.maxDuration).subscribe());
        timerServiceSpy.onTimerTick.and.returnValue(of(stubData.remainingTime).subscribe());

        component.pin = pin;
        component.ngOnInit();
        component.ngOnDestroy();

        expect(component['startTimerSubscription'].closed).toBeTrue();
        expect(component['timerTickSubscription'].closed).toBeTrue();
    });
});
