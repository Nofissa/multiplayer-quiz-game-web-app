import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { GameSummary } from '@app/interfaces/game-summary';
import { GameSummaryHttpService } from '@app/services/game-summary-http/game-summary-http.service';

@Component({
    selector: 'app-game-summary-list',
    templateUrl: './game-summary-list.component.html',
    styleUrls: ['./game-summary-list.component.scss'],
})
export class GameSummaryListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatSort) sort: MatSort;
    gameSummaries: MatTableDataSource<GameSummary>;
    displayedColumns: string[] = ['name', 'startDate', 'numberOfPlayers', 'bestScore'];

    constructor(
        private readonly gameSummaryHttpService: GameSummaryHttpService,
        private readonly dialog: MatDialog,
    ) {
        this.gameSummaries = new MatTableDataSource<GameSummary>();
    }

    ngOnInit() {
        this.fetchGameSummaries();
    }

    ngAfterViewInit() {
        this.gameSummaries.sort = this.sort;
        this.gameSummaries.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'name':
                    return item.title.toLowerCase();
                case 'startDate':
                    return new Date(item.startDate).getTime();
                default:
                    return '';
            }
        };
    }

    openClearAllSummariesDialog() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '30%',
            data: {
                title: "Supprimer l'historique des parties",
                prompt: "Êtes vous certains de vouloir supprimer l'historique des parties?",
            },
        });

        dialogRef.afterClosed().subscribe((isSubmitted: boolean) => {
            if (isSubmitted) {
                this.clearAllGameSummaries();
            }
        });
    }

    private clearAllGameSummaries() {
        this.gameSummaryHttpService.clearAllGameSummaries().subscribe({
            next: () => {
                this.fetchGameSummaries();
            },
        });
    }

    private fetchGameSummaries() {
        this.gameSummaryHttpService.getAllGameSummaries().subscribe((data: GameSummary[]) => {
            this.gameSummaries.data = data;
        });
    }
}
