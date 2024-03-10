import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Question } from '@app/interfaces/question';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { Subscription } from 'rxjs';
import { HostGamePageComponent } from './host-game-page.component';

const mockQuestion: Question = {
    _id: '123456789',
    text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
    type: 'QCM',
    choices: [
        { text: '3.14 V/m^2', isCorrect: false },
        { text: '2.72 C/s', isCorrect: false },
        { text: '6.022x10^23 mol/N', isCorrect: false },
        { text: '8.31 J/mol/K', isCorrect: true },
    ],
    points: 100,
    lastModification: new Date('2024-01-20 18:43:27'),
};

// const submissions: Submission[] = [];
// submissions[0] = {
//     choices: [
//         { index: 0, isSelected: true },
//         { index: 1, isSelected: false },
//         { index: 2, isSelected: false },
//         { index: 3, isSelected: true },
//     ],
//     isFinal: true,
// };
// const barChartData: BarChartData = { question, submissions };
// submissions[0].choices[1].isSelected = true;
// const secondBarChartData: BarChartData = { question, submissions };
// const barChartArray: BarChartData[] = [barChartData, secondBarChartData];

describe('HostGamePageComponent', () => {
    let component: HostGamePageComponent;
    let fixture: ComponentFixture<HostGamePageComponent>;
    let gameService: GameService;
    let timerService: TimerService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostGamePageComponent],
            providers: [
                GameService,
                TimerService,
                MatSnackBar,
                BarChartService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            queryParams: {
                                pin: '1234',
                            },
                        },
                    },
                },
            ],
            imports: [RouterTestingModule],
        }).compileComponents();
        fixture = TestBed.createComponent(HostGamePageComponent);
        gameService = TestBed.inject(GameService);
        timerService = TestBed.inject(TimerService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize pin from ActivatedRoute', () => {
        expect(component.pin).toEqual('1234');
    });

    it('should set isEnded to false initially', () => {
        expect(component.isEnded).toBeFalse();
    });

    it('should set gameState to GameState.Opened initially', () => {
        expect(component.gameState).toEqual(GameState.Opened);
    });

    it('should toggle game lock', () => {
        const spyToggleGameLock = spyOn(gameService, 'toggleGameLock');
        component.toggleLock();

        expect(spyToggleGameLock).toHaveBeenCalledWith('1234');
    });

    it('should be locked if the game is closed', () => {
        component.gameState = GameState.Closed;
        expect(component.isLocked()).toBeTruthy();
    });

    it('should not be locked if the game is not closed', () => {
        component.gameState = GameState.Opened;
        expect(component.isLocked()).toBeFalsy();
    });

    it('should be started if the game is started', () => {
        component.gameState = GameState.Started;
        expect(component.isStarted()).toBeTruthy();
    });

    it('should not be started if the game is not started', () => {
        component.gameState = GameState.Closed;
        expect(component.isStarted()).toBeFalsy();
    });

    it('should set pin and subscribe to gameService events', () => {
        spyOn(gameService, 'onNextQuestion');
        spyOn(gameService, 'onToggleGameLock');
        spyOn(gameService, 'getCurrentQuestion');

        component.ngOnInit();

        expect(component.pin).toEqual('1234');
        expect(gameService.onNextQuestion).toHaveBeenCalledWith('1234', jasmine.any(Function));
        expect(gameService.onToggleGameLock).toHaveBeenCalledWith('1234', jasmine.any(Function));
        expect(gameService.getCurrentQuestion).toHaveBeenCalledWith('1234');
    });

    it('should set question to the current question', () => {
        const fakeSubscription = new Subscription();
        spyOn(gameService, 'onGetCurrentQuestion').and.callFake((pin, callback) => {
            callback(mockQuestion);
            return fakeSubscription;
        });
        component.ngOnInit();

        expect(component.question).toEqual(mockQuestion);
    });

    it('should unsubscribe from getCurrentQuestionSubscription on ngOnDestroy', () => {
        const getCurrentQuestionSubscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
        component.getCurrentQuestionSubscription = getCurrentQuestionSubscriptionSpy;
        component.ngOnDestroy();

        expect(getCurrentQuestionSubscriptionSpy.unsubscribe).toHaveBeenCalled();
    });

    it('should set gameState to Started and call startTimer on timerService', () => {
        spyOn(timerService, 'startTimer');
        component.startGame();

        expect(component['gameState']).toBe(GameState.Started);

        expect(timerService.startTimer).toHaveBeenCalledWith(component['pin']);
    });

    it('should set nextAvailable to true', () => {
        component.nextAvailable = false;
        component.onTimerExpired();

        expect(component.nextAvailable).toBeTruthy();
    });
});
