import { Injectable } from '@angular/core';
import { Question } from '@common/question';
import { Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuestionSharingService {
    private shareSubject: Subject<Question> = new Subject<Question>();

    share(question: Question): void {
        this.shareSubject.next(question);
    }

    subscribe(callback: (question: Question) => void): Subscription {
        return this.shareSubject.subscribe(callback);
    }
}
