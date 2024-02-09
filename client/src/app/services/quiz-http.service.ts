import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuizHttpService {
    private readonly baseUrl: string = `${environment.serverUrl}/quizzes`;

    constructor(private readonly http: HttpClient) {}

    getAllQuizzes(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(this.baseUrl).pipe(
            map((quizzes: Quiz[]) => this.convertAllLastModifiedToDate(quizzes)),
            catchError(this.handleError<Quiz[]>()),
        );
    }

    getVisibleQuizzes(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.baseUrl}?isVisible=true`).pipe(
            map((quizzes: Quiz[]) => this.convertAllLastModifiedToDate(quizzes)),
            catchError(this.handleError<Quiz[]>()),
        );
    }

    getQuizById(id: string): Observable<Quiz> {
        return this.http.get<Quiz>(`${this.baseUrl}/${id}`).pipe(
            map((quiz: Quiz) => this.convertLastModifiedToDate(quiz)),
            catchError(this.handleError<Quiz>()),
        );
    }

    getVisibleQuizById(id: string): Observable<Quiz> {
        return this.http.get<Quiz>(`${this.baseUrl}/${id}?visibleOnly=true`).pipe(
            map((quiz: Quiz) => this.convertLastModifiedToDate(quiz)),
            catchError(this.handleError<Quiz>()),
        );
    }

    createQuiz(quiz: Quiz): Observable<Quiz> {
        return this.http.post<Quiz>(this.baseUrl, quiz).pipe(
            map((createdQuiz: Quiz) => this.convertLastModifiedToDate(createdQuiz)),
            catchError(this.handleError<Quiz>()),
        );
    }

    updateQuiz(quiz: Quiz): Observable<Quiz> {
        return this.http.put<Quiz>(this.baseUrl, quiz).pipe(
            map((updatedQuiz: Quiz) => this.convertLastModifiedToDate(updatedQuiz)),
            catchError(this.handleError<Quiz>()),
        );
    }

    deleteQuizById(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError<void>()));
    }

    hideQuizById(id: string): Observable<Quiz> {
        return this.http.patch<Quiz>(`${this.baseUrl}/hide/${id}`, {}).pipe(
            map((hiddenQuiz: Quiz) => this.convertLastModifiedToDate(hiddenQuiz)),
            catchError(this.handleError<Quiz>()),
        );
    }

    private convertLastModifiedToDate(quiz: Quiz): Quiz {
        return {
            ...quiz,
            lastModification: new Date(quiz.lastModification),
        };
    }

    private convertAllLastModifiedToDate(quizzes: Quiz[]): Quiz[] {
        return quizzes.map(this.convertLastModifiedToDate);
    }

    private handleError<T>(): (error: HttpErrorResponse) => Observable<T> {
        // eslint-disable-next-line no-unused-vars
        return (httpErrorResponse: HttpErrorResponse): Observable<T> => {
            return throwError(() => httpErrorResponse);
        };
    }
}
