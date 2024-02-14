import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class QuestionSharingService {
    private callbacks: ((data: Question) => void)[] = [];

    share(data: Question): void {
        this.callbacks.forEach((callback) => {
            callback(data);
        });
    }

    subscribe(callback: (data: Question) => void): void {
        this.callbacks.push(callback);
    }
}
