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

describe('GameTransitionComponent', () => {
    let component: GameTransitionComponent;
    let fixture: ComponentFixture<GameTransitionComponent>;
    let gameHttpServiceSpy: jasmine.SpyObj<GameHttpService>;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;

    beforeEach(async () => {
        const gameHttpServiceMock = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        const timerServiceMock = jasmine.createSpyObj('TimerService', ['onStartTimer']);

        await TestBed.configureTestingModule({
            declarations: [GameTransitionComponent],
            providers: [
                GameServicesProvider,
                MatSnackBar,
                { provide: GameHttpService, useValue: gameHttpServiceMock },
                { provide: TimerService, useValue: timerServiceMock },
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set up subscriptions on initialization', () => {
        expect(timerServiceSpy.onStartTimer).toHaveBeenCalledWith(component.pin, jasmine.any(Function));
    });

    it('should unsubscribe subscriptions on destruction', () => {
        const subscriptionsCount = component['eventSubscriptions'].length;
        component.ngOnDestroy();
        expect(component['eventSubscriptions'].length).toBeLessThan(subscriptionsCount);
    });

    it('should update snapshot on onStartTimer event', () => {
        const expectedSnapshot: GameSnapshot = {
            players: [],
            chatlogs: [],
            quiz: quizStub(),
            state: GameState.Opened,
            currentQuestionIndex: 0,
            questionSubmissions: [],
        };
        gameHttpServiceSpy.getGameSnapshotByPin.and.returnValue(of(expectedSnapshot));

        const onStartTimerCallback = timerServiceSpy.onStartTimer.calls.mostRecent().args[1] as () => void;
        onStartTimerCallback();

        expect(component.snapshot).toEqual(expectedSnapshot);
    });
});
