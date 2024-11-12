import { Injectable } from '@angular/core';
import { QuestionHttpService } from '@app/services/question-http/question-http.service';
import { QuestionSharingService } from '@app/services/question-sharing/question-sharing.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionServicesProvider {
    constructor(
        private readonly questionHttpService: QuestionHttpService,
        private readonly questionSharingService: QuestionSharingService,
    ) {}

    get questionHttp(): QuestionHttpService {
        return this.questionHttpService;
    }

    get questionSharing(): QuestionSharingService {
        return this.questionSharingService;
    }
}
