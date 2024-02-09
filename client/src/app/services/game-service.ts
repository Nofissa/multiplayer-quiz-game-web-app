import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Choice } from '@app/interfaces/choice';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private apiURL = `${environment.serverUrl}/game`;
    constructor(private http: HttpClient) {}

    validateAnswers(selectedChoices: Choice[], quizID: string, questionIndex: number): Observable<number> {
        const url = `${this.apiURL}/evaluateChoices/${quizID}?questionIndex=${questionIndex}`;
        return this.http.post<number>(url, selectedChoices);
    }

    areChoicesCorrect(selectedChoices: Choice[]): boolean {
        const allCorrect = selectedChoices.every((x) => x.isCorrect);

        return selectedChoices.length !== 0 && allCorrect;
    }
}
