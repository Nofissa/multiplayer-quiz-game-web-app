import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameHistory } from '@app/interfaces/game-history';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryHttpService {
    private readonly baseUrl: string = `${environment.apiUrl}/gameHistories`;

    constructor(private readonly http: HttpClient) {}

    get apiUrl() {
        return this.baseUrl;
    }

    getAllGameHistories(sortField?: string, orderDirection?: 'asc' | 'desc'): Observable<GameHistory[]> {
        let params = new HttpParams();
        if (sortField) {
            params = params.append('sortField', sortField);
        }
        if (orderDirection) {
            params = params.append('orderDirection', orderDirection);
        }

        return this.http.get<GameHistory[]>(this.baseUrl, { params }).pipe(
            map((gameHistories: GameHistory[]) => this.convertAllStartDateToDate(gameHistories)),
            catchError(this.handleError<GameHistory[]>()),
        );
    }

    private convertstartDateToDate(gameHistory: GameHistory): GameHistory {
        return {
            ...gameHistory,
            startDate: new Date(gameHistory.startDate),
        };
    }

    private convertAllStartDateToDate(gameHistories: GameHistory[]): GameHistory[] {
        return gameHistories.map(this.convertstartDateToDate);
    }

    private handleError<T>(): (error: HttpErrorResponse) => Observable<T> {
        return (httpErrorResponse: HttpErrorResponse): Observable<T> => {
            return throwError(() => httpErrorResponse);
        };
    }
}
