import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@common/question';
import { Observable, Subject, Subscription, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuestionHttpService {
    private subject = new Subject<Question[]>();
    private readonly baseUrl: string = `${environment.apiUrl}/questions`;

    constructor(private readonly http: HttpClient) {}

    get apiUrl() {
        return this.baseUrl;
    }

    getAllQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(this.baseUrl).pipe(
            map((questions) => this.convertAllLastModificationToDate(questions)),
            catchError(this.handleError<Question[]>()),
        );
    }

    createQuestion(question: Question): Observable<Question> {
        return this.http.post<Question>(this.baseUrl, question).pipe(
            tap(() => {
                this.getAllQuestions().subscribe((questions) => {
                    this.subject.next(questions);
                });
            }),
            map((createdQuestion) => this.convertLastModificationToDate(createdQuestion)),
            catchError(this.handleError<Question>()),
        );
    }

    updateQuestion(question: Question): Observable<Question> {
        return this.http.put<Question>(this.baseUrl, question).pipe(
            tap(() => {
                this.getAllQuestions().subscribe((questions) => {
                    this.subject.next(questions);
                });
            }),
            map((updatedQuestion) => this.convertLastModificationToDate(updatedQuestion)),
            catchError(this.handleError<Question>()),
        );
    }

    deleteQuestionById(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
            tap(() => {
                this.getAllQuestions().subscribe((questions) => {
                    this.subject.next(questions);
                });
            }),
            catchError(this.handleError<void>()),
        );
    }

    onChange(callback: (questions: Question[]) => void): Subscription {
        return this.subject.subscribe(callback);
    }

    private convertLastModificationToDate(question: Question): Question {
        return {
            ...question,
            lastModification: new Date(question.lastModification),
        };
    }

    private convertAllLastModificationToDate(questions: Question[]): Question[] {
        return questions.map(this.convertLastModificationToDate);
    }

    private handleError<T>(): (error: HttpErrorResponse) => Observable<T> {
        return (httpErrorResponse: HttpErrorResponse): Observable<T> => {
            return throwError(() => new Error(httpErrorResponse.error));
        };
    }
}
