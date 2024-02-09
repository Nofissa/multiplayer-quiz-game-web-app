/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { QuestionHttpService } from '@app/services/question-http.service';
import { QuestionSharingService } from '@app/services/question-sharing.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionServicesProvider {
    constructor(
        private readonly _questionHttpService: QuestionHttpService,
        private readonly _questionSharingService: QuestionSharingService,
    ) {}

    get questionHttpService(): QuestionHttpService {
        return this._questionHttpService;
    }

    get questionSharingService(): QuestionSharingService {
        return this._questionSharingService;
    }
}
