import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@common/question';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuestionHttpService {
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
            map((createdQuestion) => this.convertLastModificationToDate(createdQuestion)),
            catchError(this.handleError<Question>()),
        );
    }

    updateQuestion(question: Question): Observable<Question> {
        return this.http.put<Question>(this.baseUrl, question).pipe(
            map((updatedQuestion) => this.convertLastModificationToDate(updatedQuestion)),
            catchError(this.handleError<Question>()),
        );
    }

    deleteQuestionById(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError<void>()));
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
