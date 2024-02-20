import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PlayerHttpService {
    private readonly baseUrl: string = `${environment.serverUrl}/players`;

    constructor(private readonly http: HttpClient) {}

    get apiUrl() {
        return this.baseUrl;
    }

    getAllPlayers() {
        return this.http.get<Player[]>(this.baseUrl).pipe(catchError(this.handleError<Player[]>()));
    }

    private handleError<T>(): (error: HttpErrorResponse) => Observable<T> {
        return (httpErrorResponse: HttpErrorResponse): Observable<T> => {
            return throwError(() => new Error(httpErrorResponse.error));
        };
    }
}
