import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameSummary } from '@app/interfaces/game-summary';
import { Observable, catchError, map, throwError } from 'rxjs';
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

    getAllGameSummaries(): Observable<GameSummary[]> {
        return this.http.get<GameSummary[]>(this.baseUrl).pipe(
            map((gameSummaries: GameSummary[]) => this.convertAllStartDateToDate(gameSummaries)),
            catchError(this.handleError<GameSummary[]>()),
        );
    }

    clearAllGameSummaries(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/deleteAll`);
    }

    private convertStartDateToDate(gameSummary: GameSummary): GameSummary {
        return {
            ...gameSummary,
            startDate: new Date(gameSummary.startDate),
        };
    }

    private convertAllStartDateToDate(gameSummaries: GameSummary[]): GameSummary[] {
        return gameSummaries.map(this.convertStartDateToDate);
    }

    private handleError<T>(): (error: HttpErrorResponse) => Observable<T> {
        return (httpErrorResponse: HttpErrorResponse): Observable<T> => {
            return throwError(() => httpErrorResponse);
        };
    }
}
