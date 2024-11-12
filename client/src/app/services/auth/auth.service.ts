import { AuthPayload } from '@common/auth-payload';
import { UserCredentialSet } from '@common/user-credential-set';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly baseUrl: string = `${environment.apiUrl}/auth`;

    constructor(private readonly http: HttpClient) {}

    get apiUrl() {
        return this.baseUrl;
    }

    login(userCredentialSet: UserCredentialSet): Observable<AuthPayload> {
        return this.http.post<AuthPayload>(`${this.baseUrl}/login`, userCredentialSet).pipe(catchError(this.handleError<AuthPayload>()));
    }

    verify(payload: AuthPayload): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/verify`, payload).pipe(catchError(this.handleError<void>()));
    }

    private handleError<T>(): (error: HttpErrorResponse) => Observable<T> {
        return (httpErrorResponse: HttpErrorResponse): Observable<T> => {
            return throwError(() => new Error(httpErrorResponse.error));
        };
    }
}
