import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameSnapshot } from '@common/game-snapshot';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameHttpService {
    private readonly baseUrl: string = `${environment.apiUrl}/games`;

    constructor(private readonly http: HttpClient) {}

    get apiUrl() {
        return this.baseUrl;
    }

    getGameSnapshotByPin(pin: string): Observable<GameSnapshot> {
        return this.http.get<GameSnapshot>(`${this.baseUrl}/${pin}/snapshot`).pipe(catchError(this.handleError<GameSnapshot>()));
    }

    private handleError<T>(): (error: HttpErrorResponse) => Observable<T> {
        return (httpErrorResponse: HttpErrorResponse): Observable<T> => {
            return throwError(() => httpErrorResponse);
        };
    }
}
