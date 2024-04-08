import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameSummary } from '@app/interfaces/game-summary';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameSummaryHttpService {
    private readonly baseUrl: string = `${environment.apiUrl}/gameSummaries`;

    constructor(private readonly http: HttpClient) {}

    get apiUrl() {
        return this.baseUrl;
    }

    getAllGameSummaries(sortField?: string, orderDirection?: 'asc' | 'desc'): Observable<GameSummary[]> {
        let params = new HttpParams();
        if (sortField) {
            params = params.append('sortField', sortField);
        }
        if (orderDirection) {
            params = params.append('orderDirection', orderDirection);
        }

        return this.http.get<GameSummary[]>(this.baseUrl, { params }).pipe(
            map((gameSummaries: GameSummary[]) => this.convertAllStartDateToDate(gameSummaries)),
            catchError(this.handleError<GameSummary[]>()),
        );
    }

    private convertstartDateToDate(gameSummary: GameSummary): GameSummary {
        return {
            ...gameSummary,
            startDate: new Date(gameSummary.startDate),
        };
    }

    private convertAllStartDateToDate(gameHistories: GameSummary[]): GameSummary[] {
        return gameHistories.map(this.convertstartDateToDate);
    }

    private handleError<T>(): (error: HttpErrorResponse) => Observable<T> {
        return (httpErrorResponse: HttpErrorResponse): Observable<T> => {
            return throwError(() => httpErrorResponse);
        };
    }
}
