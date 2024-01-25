import { Component, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionSharingService } from '@app/services/question-sharing.service';

@Component({
    selector: 'app-share-test',
    templateUrl: './share-test.component.html',
})
export class ShareTestComponent implements OnInit {
    questions: Question[] = [];

    constructor(private readonly questionSharingService: QuestionSharingService) {}

    ngOnInit(): void {
        this.questionSharingService.subscribe((question: Question) => {
            if (!this.questions.some((x) => question === x)) {
                this.questions.push(question);
            }
        });
    }
}
