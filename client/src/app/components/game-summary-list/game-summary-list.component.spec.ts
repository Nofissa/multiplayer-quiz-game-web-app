import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { gameSummariesStub } from '@app/test-stubs/game-summary.stubs';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { GameSummary } from '@app/interfaces/game-summary';
import { GameSummaryHttpService } from '@app/services/game-summary-http/game-summary-http.service';
import { of } from 'rxjs';
import { GameSummaryListComponent } from './game-summary-list.component';

describe('GameSummaryListComponent', () => {
    let component: GameSummaryListComponent;
    let fixture: ComponentFixture<GameSummaryListComponent>;
    let gameSummaryHttpServiceMock: jasmine.SpyObj<GameSummaryHttpService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let matSort: MatSort;

    beforeEach(async () => {
        gameSummaryHttpServiceMock = jasmine.createSpyObj('GameSummaryHttpService', ['getAllGameSummaries', 'clearAllGameSummaries']);
        gameSummaryHttpServiceMock.getAllGameSummaries.and.returnValue(of(gameSummariesStub));
        gameSummaryHttpServiceMock.clearAllGameSummaries.and.returnValue(of(undefined));

        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        dialogRefSpy.afterClosed.and.returnValue(of(true));

        dialogSpy.open.and.returnValue(dialogRefSpy);

        await TestBed.configureTestingModule({
            imports: [MatSortModule, NoopAnimationsModule],
            declarations: [GameSummaryListComponent],
            providers: [
                { provide: GameSummaryHttpService, useValue: gameSummaryHttpServiceMock },
                { provide: MatDialog, useValue: { open: () => dialogRefSpy } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSummaryListComponent);
        component = fixture.componentInstance;
        matSort = new MatSort();
        component.sort = matSort;
        component.gameSummaries = new MatTableDataSource<GameSummary>(gameSummariesStub);
        component.gameSummaries.sort = matSort;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getAllGameSummaries on init', () => {
        expect(gameSummaryHttpServiceMock.getAllGameSummaries).toHaveBeenCalled();
    });

    it('should call clearAllGameSummaries when dialog confirms', () => {
        component.openClearAllSummariesDialog();
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(gameSummaryHttpServiceMock.clearAllGameSummaries).toHaveBeenCalled();
    });

    it('should load game summaries into MatTableDataSource', () => {
        expect(component.gameSummaries.data).toEqual(gameSummariesStub);
    });

    it('should not clear summaries if dialog is canceled', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        component.openClearAllSummariesDialog();
        fixture.detectChanges();
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(gameSummaryHttpServiceMock.clearAllGameSummaries).not.toHaveBeenCalled();
    });

    describe('sorting', () => {
        it('should sort by name ascending', () => {
            component.sort.active = 'name';
            component.sort.direction = 'asc';
            const sortedData = component.gameSummaries.sortData(component.gameSummaries.data, component.sort);
            expect(sortedData[0].title).toEqual('Game A');
            expect(sortedData[1].title).toEqual('Game B');
            expect(sortedData[2].title).toEqual('Game C');
        });

        it('should sort by startDate ascending', () => {
            component.sort.active = 'startDate';
            component.sort.direction = 'asc';
            const sortedData = component.gameSummaries.sortData(component.gameSummaries.data, component.sort);
            expect(sortedData[0].startDate).toEqual(gameSummariesStub[0].startDate);
            expect(sortedData[1].startDate).toEqual(gameSummariesStub[1].startDate);
            expect(sortedData[2].startDate).toEqual(gameSummariesStub[2].startDate);
        });

        it('should handle unknown sort property by returning default value', () => {
            component.sort.active = 'unknownProperty';
            component.sort.direction = 'asc';
            const sortedData = component.gameSummaries.sortData(component.gameSummaries.data, component.sort);
            expect(sortedData).toEqual(gameSummariesStub);
        });
    });
});
