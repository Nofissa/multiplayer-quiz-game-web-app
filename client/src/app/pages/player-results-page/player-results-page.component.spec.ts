import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { barChartDataStub } from '@app/test-stubs/bar-chart-data.stubs';
import { quizStub } from '@app/test-stubs/quiz.stubs';
import { BarChartData } from '@app/interfaces/bar-chart-data';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { BarChartService } from '@app/services/game/bar-chart-service/bar-chart.service';
import { GameSnapshot } from '@common/game-snapshot';
import { GameState } from '@common/game-state';
import { of, throwError } from 'rxjs';
import { PlayerResultsPageComponent } from './player-results-page.component';

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

describe('PlayerResultsPageComponent', () => {
    let component: PlayerResultsPageComponent;
    let fixture: ComponentFixture<PlayerResultsPageComponent>;
    let mockRouter: Partial<Router>;
    let mockGameHttpService: jasmine.SpyObj<GameHttpService>;
    let mockBarChartService: jasmine.SpyObj<BarChartService>;

    beforeEach(() => {
        const activatedRouteSpy = {
            snapshot: {
                queryParams: { pin: '1234' },
            },
        };

        mockRouter = {
            navigateByUrl: jasmine.createSpy('navigateByUrl'),
        };

        mockGameHttpService = jasmine.createSpyObj('GameHttpService', ['getGameSnapshotByPin']);
        mockBarChartService = jasmine.createSpyObj('BarChartService', ['getAllBarChart', 'setData']);

        TestBed.configureTestingModule({
            declarations: [PlayerResultsPageComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: Router, useValue: mockRouter },
                { provide: GameHttpService, useValue: mockGameHttpService },
                { provide: BarChartService, useValue: mockBarChartService },
                MatSnackBar,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerResultsPageComponent);
        component = fixture.componentInstance;
    });

    it('should return chartData from barChartService', () => {
        const mockChartData: BarChartData[] = [barChartDataStub()[0]];

        mockBarChartService.getAllBarChart.and.returnValue(mockChartData);
        mockGameHttpService.getGameSnapshotByPin.and.returnValue(of(gameSnapshotStub));

        component.ngOnInit();

        expect(component.chartData).toEqual(mockChartData);
    });

    it('should navigate to "/home" when leaveGame() is called', () => {
        component.leaveGame();

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });

    it('should handle error and navigate to "/home" when there is an error', () => {
        const errorResponse = new HttpErrorResponse({ status: HttpStatusCode.NotFound });

        mockGameHttpService.getGameSnapshotByPin.and.returnValue(throwError(() => errorResponse));

        component.ngOnInit();

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
    });
});
