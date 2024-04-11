import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { GameSummary } from '@app/interfaces/game-summary';
import { GameSummaryHttpService } from '@app/services/game-summary-http/game-summary-http.service';

@Component({
    selector: 'app-game-summary',
    templateUrl: './game-summary.component.html',
    styleUrls: ['./game-summary.component.scss'],
})
export class GameSummaryComponent implements OnInit, AfterViewInit {
    @ViewChild(MatSort) sort: MatSort;
    gameSummaries: MatTableDataSource<GameSummary>;
    displayedColumns: string[] = ['name', 'startDate', 'numberOfPlayers', 'bestScore'];

    constructor(private readonly gameSummaryHttpService: GameSummaryHttpService) {
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
                case 'numberOfPlayers':
                    return item.numberOfPlayers;
                case 'bestScore':
                    return item.bestScore;
                default:
                    return '';
            }
        };
    }

    clearAllGameSummaries() {
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
