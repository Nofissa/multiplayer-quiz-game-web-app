import { Injectable } from '@angular/core';
import { Question } from '@common/question';

@Injectable()
export class QuestionInteractionService {
    private onAddQuestion: () => void;
    private onEditQuestion: (question: Question) => void;
    private onDeleteQuestion: (question: Question) => void;
    private onShareQuestion: (question: Question) => void;

    registerOnAddQuestion(callback: () => void): void {
        this.onAddQuestion = callback;
    }

    registerOnEditQuestion(callback: (question: Question) => void): void {
        this.onEditQuestion = callback;
    }

    registerOnDeleteQuestion(callback: (question: Question) => void): void {
        this.onDeleteQuestion = callback;
    }

    registerOnShareQuestion(callback: (question: Question) => void): void {
        this.onShareQuestion = callback;
    }

    invokeOnAddQuestion(): void {
        if (this.onAddQuestion) {
            this.onAddQuestion();
        }
    }

    invokeOnEditQuestion(question: Question): void {
        if (this.onEditQuestion) {
            this.onEditQuestion(question);
        }
    }

    invokeOnDeleteQuestion(question: Question): void {
        if (this.onDeleteQuestion) {
            this.onDeleteQuestion(question);
        }
    }

    invokeOnShareQuestion(question: Question): void {
        if (this.onShareQuestion) {
            this.onShareQuestion(question);
        }
    }
}
