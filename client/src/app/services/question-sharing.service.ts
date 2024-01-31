/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class QuestionSharingService {
    private callbacks: ((data: Question) => any)[] = [];

    share(data: Question): void {
        this.callbacks.forEach((callback) => {
            callback(data);
        });
    }

    subscribe(callback: (data: Question) => any): void {
        this.callbacks.push(callback);
    }
}
