import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameTransitionDisplayOptions } from '@app/interfaces/game-transition-display-options';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { TimerService } from '@app/services/timer/timer.service';
import { quizStub } from '@app/test-stubs/quiz.stubs';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { TimerEventType } from '@common/timer-event-type';
import { TimerPayload } from '@common/timer-payload';
import { Subscription, of } from 'rxjs';
import { GameTransitionComponent } from './game-transition.component';

const gameSnapshotStub: GameSnapshot = {
    players: [],
    chatlogs: [],
    quiz: quizStub(),
    state: GameState.Paused,
    currentQuestionIndex: 0,
    questionQcmSubmissions: [],
    questionQrlSubmission: [],
    questionQrlEvaluation: [],
};

describe('GameTransitionComponent', () => {
    let component: GameTransitionComponent;
    let fixture: ComponentFixture<GameTransitionComponent>;
    let gameHttpServiceSpy: jasmine.SpyObj<GameHttpService>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    const pin = '1234';

    beforeEach(async () => {
        const gameHttpServiceMock = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        const timerServiceMock = jasmine.createSpyObj('TimerService', ['onStartTimer', 'onTimerTick']);

        await TestBed.configureTestingModule({
            declarations: [GameTransitionComponent],
            imports: [HttpClientTestingModule],
            providers: [
                GameServicesProvider,
                { provide: GameHttpService, useValue: gameHttpServiceMock },
                { provide: TimerService, useValue: timerServiceMock },
                MatSnackBar,
            ],
        }).compileComponents();

        gameHttpServiceSpy = TestBed.inject(GameHttpService) as jasmine.SpyObj<GameHttpService>;
        timerServiceSpy = TestBed.inject(TimerService) as jasmine.SpyObj<TimerService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameTransitionComponent);
        const options: GameTransitionDisplayOptions = {
            hideTimerOnStartingGame: true,
            hideTimerOnLoadingNextQuestion: false,
            keepDisplayingCurrentQuestion: false,
            transitionalOnly: true,
        };
        component = fixture.componentInstance;
        component.displayOptions = options;
        component.pin = pin;
        component['eventSubscriptions'].length = 0;
        component['eventSubscriptions'] = [new Subscription(), new Subscription()];
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        component['eventSubscriptions'] = component['eventSubscriptions'].filter((item) => item !== undefined);
        expect(component).toBeTruthy();
    });

    it('should set up subscriptions on initialization', () => {
        // only way to spy on a component's private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'setupSubscription');
        component['eventSubscriptions'] = component['eventSubscriptions'].filter((item) => item !== undefined);
        component.ngOnInit();

        expect(component['setupSubscription']).toHaveBeenCalledWith(pin);
    });

    it('should setup subscriptions correctly', () => {
        timerServiceSpy.onStartTimer.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 20, eventType: TimerEventType.Question };
            callback(payload);
            return of(payload).subscribe(callback);
        });

        timerServiceSpy.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 0, eventType: TimerEventType.Question };
            callback(payload);
            return of(payload).subscribe(callback);
        });

        gameHttpServiceSpy.getGameSnapshotByPin.and.returnValue(of(gameSnapshotStub));
        component['eventSubscriptions'] = component['eventSubscriptions'].filter((item) => item !== undefined);

        component['setupSubscription'](pin);

        expect(timerServiceSpy.onStartTimer).toHaveBeenCalledWith(pin, jasmine.any(Function));
        expect(timerServiceSpy.onTimerTick).toHaveBeenCalledWith(pin, jasmine.any(Function));

        expect(gameHttpServiceSpy.getGameSnapshotByPin).toHaveBeenCalledWith(pin);
    });

    it('should set flags correctly based on timer event type onStartTimer', () => {
        gameHttpServiceSpy.getGameSnapshotByPin.and.returnValue(of(gameSnapshotStub));

        timerServiceSpy.onStartTimer.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 20, eventType: TimerEventType.StartGame };
            callback(payload);
            return of(payload).subscribe(callback);
        });

        component['setupSubscription'](pin);
        expect(component.isStartingGame).toBeTruthy();

        timerServiceSpy.onStartTimer.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 10, eventType: TimerEventType.NextQuestion };
            callback(payload);
            return of(payload).subscribe(callback);
        });

        component['setupSubscription'](pin);
        expect(component.isLoadingNextQuestion).toBeTruthy();

        timerServiceSpy.onStartTimer.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 5, eventType: TimerEventType.Question };
            callback(payload);
            return of(payload).subscribe(callback);
        });

        component['setupSubscription'](pin);
        component['eventSubscriptions'] = component['eventSubscriptions'].filter((item) => item !== undefined);
        expect(component.isQuestion).toBeTruthy();
    });

    it('should set flags correctly based on timer event type onTimerTick', () => {
        gameHttpServiceSpy.getGameSnapshotByPin.and.returnValue(of(gameSnapshotStub));

        timerServiceSpy.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 0, eventType: TimerEventType.StartGame };
            callback(payload);
            return of(payload).subscribe(callback);
        });

        component['setupSubscription'](pin);

        expect(component.isStartingGame).toBeFalsy();

        timerServiceSpy.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 0, eventType: TimerEventType.NextQuestion };
            callback(payload);
            return of(payload).subscribe(callback);
        });

        component['setupSubscription'](pin);
        expect(component.isLoadingNextQuestion).toBeFalsy();

        timerServiceSpy.onTimerTick.and.callFake((_pin: string, callback: (payload: TimerPayload) => void) => {
            const payload = { remainingTime: 0, eventType: TimerEventType.Question };
            callback(payload);
            return of(payload).subscribe(callback);
        });

        component['eventSubscriptions'] = component['eventSubscriptions'].filter((item) => item !== undefined);
        expect(component.isQuestion).toBeFalsy();
    });

    it('should unsubscribe subscriptions on destruction', () => {
        component['eventSubscriptions'] = component['eventSubscriptions'].filter((item) => item !== undefined);
        const subscriptionsCount = component['eventSubscriptions'].length;
        component.ngOnDestroy();
        expect(component['eventSubscriptions'].length).toBeLessThan(subscriptionsCount);
    });
});
