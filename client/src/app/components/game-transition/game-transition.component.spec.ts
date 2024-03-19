import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { quizStub } from '@app/TestStubs/quiz.stubs';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { of } from 'rxjs';
import { GameTransitionComponent } from './game-transition.component';

const gameSnapshotStub: GameSnapshot = {
    players: [],
    chatlogs: [],
    quiz: quizStub(),
    state: GameState.Paused,
    currentQuestionIndex: 0,
    questionSubmissions: [],
};

fdescribe('GameTransitionComponent', () => {
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
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set up subscriptions on initialization', () => {
        const onStartTimerCallback = timerServiceSpy.onStartTimer.calls.mostRecent().args[1] as () => void;
        onStartTimerCallback();

        expect(gameHttpServiceSpy.getGameSnapshotByPin).toHaveBeenCalledWith(pin);
    });

    it('should update snapshot on onStartTimer event', () => {
        gameHttpServiceSpy.getGameSnapshotByPin.and.returnValue(of(gameSnapshotStub));

        const onStartTimerCallback = timerServiceSpy.onStartTimer.calls.mostRecent().args[1] as () => void;
        onStartTimerCallback();

        expect(component.snapshot).toEqual(gameSnapshotStub);
    });

    it('should handle onStartTimer event types correctly', () => {
        const onStartTimerCallback = timerServiceSpy.onStartTimer.calls.mostRecent().args[1] as () => void;

        onStartTimerCallback();
        expect(component.isStartingGame).toBe(true);

        onStartTimerCallback();
        expect(component.isLoadingNextQuestion).toBe(true);

        onStartTimerCallback();
        expect(component.isQuestion).toBe(true);
    });

    it('should handle onTimerTick event types correctly', () => {
        const onTimerTickCallback = timerServiceSpy.onTimerTick.calls.mostRecent().args[1] as () => void;

        onTimerTickCallback();
        expect(component.isStartingGame).toBe(false);

        onTimerTickCallback();
        expect(component.isLoadingNextQuestion).toBe(false);

        onTimerTickCallback();
        expect(component.isQuestion).toBe(false);
    });

    it('should unsubscribe subscriptions on destruction', () => {
        const subscriptionsCount = component['eventSubscriptions'].length;
        component.ngOnDestroy();
        expect(component['eventSubscriptions'].length).toBeLessThan(subscriptionsCount);
    });
});
