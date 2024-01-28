import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuestionHttpService {
    private readonly baseUrl: string = `${environment.serverUrl}/questions`;

    constructor(private readonly http: HttpClient) {}

    getAllQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(this.baseUrl).pipe(
            map((questions) => this.convertAllLastModifiedToDate(questions)),
            catchError(this.handleError<Question[]>('Error getting questions')),
        );
    }

    createQuestion(question: Question): Observable<Question> {
        return this.http.post<Question>(this.baseUrl, question).pipe(
            map((createdQuestion) => this.convertLastModifiedToDate(createdQuestion)),
            catchError(this.handleError<Question>('Error creating question')),
        );
    }

    updateQuestion(question: Question): Observable<Question> {
        return this.http.put<Question>(this.baseUrl, question).pipe(
            map((updatedQuestion) => this.convertLastModifiedToDate(updatedQuestion)),
            catchError(this.handleError<Question>('Error updating question')),
        );
    }

    deleteQuestionById(id: string): Observable<Question> {
        return this.http.delete<Question>(`${this.baseUrl}/${id}`).pipe(
            map((deletedQuestion) => this.convertLastModifiedToDate(deletedQuestion)),
            catchError(this.handleError<Question>('Error deleting question')),
        );
    }

    private convertLastModifiedToDate(question: Question): Question {
        return {
            ...question,
            lastModified: new Date(question.lastModified),
        };
    }

    private convertAllLastModifiedToDate(questions: Question[]): Question[] {
        return questions.map(this.convertLastModifiedToDate);
    }

    private handleError<T>(errorMessage: string): (error: HttpErrorResponse) => Observable<T> {
        // eslint-disable-next-line no-unused-vars
        return (httpErrorResponse: HttpErrorResponse): Observable<T> => {
            return throwError(() => new Error(`${errorMessage}: ${httpErrorResponse.error.message}`));
        };
    }
}
