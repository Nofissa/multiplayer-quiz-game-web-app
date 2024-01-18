import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    get(url: string): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/${url}`).pipe(catchError(this.handleError<Message>('GET')));
    }

    post(url: string, message: Message): Observable<HttpResponse<string>> {
        return this.http
            .post(`${this.baseUrl}${url}`, message, { observe: 'response', responseType: 'text' })
            .pipe(catchError(this.handleError<HttpResponse<string>>('POST')));
    }

    put(url: string, message: Message): Observable<HttpResponse<string>> {
        return this.http
            .put(`${this.baseUrl}${url}`, message, { observe: 'response', responseType: 'text' })
            .pipe(catchError(this.handleError<HttpResponse<string>>('PUT')));
    }

    patch(url: string, message: Message): Observable<HttpResponse<string>> {
        return this.http
            .patch(`${this.baseUrl}${url}`, message, { observe: 'response', responseType: 'text' })
            .pipe(catchError(this.handleError<HttpResponse<string>>('PATCH')));
    }

    delete(url: string): Observable<HttpResponse<string>> {
        return this.http
            .delete(`${this.baseUrl}${url}`, { observe: 'response', responseType: 'text' })
            .pipe(catchError(this.handleError<HttpResponse<string>>('DELETE')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (): Observable<T> => {
            return of(result as T);
        };
    }
}
