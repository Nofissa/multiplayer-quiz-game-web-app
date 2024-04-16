import { TestBed } from '@angular/core/testing';
import { qcmQuestionStub } from '@app/test-stubs/question.stubs';
import { Question } from '@common/question';
import { QuestionSharingService } from './question-sharing.service';

describe('QuestionSharingService', () => {
    let service: QuestionSharingService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [QuestionSharingService],
        });
        service = TestBed.inject(QuestionSharingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should share data to multiple subscribed callbacks', () => {
        const questionMock: Question = qcmQuestionStub()[0];

        // eslint-disable-next-line @typescript-eslint/no-empty-function, no-unused-vars
        const firstCallbackSpy = jasmine.createSpy('firstCallback', (_question: Question) => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function, no-unused-vars
        const secondCallbackSpy = jasmine.createSpy('secondCallback', (_question: Question) => {});

        service.subscribe(firstCallbackSpy);
        service.subscribe(secondCallbackSpy);

        service.share(questionMock);

        expect(firstCallbackSpy).toHaveBeenCalledWith(questionMock);
        expect(secondCallbackSpy).toHaveBeenCalledWith(questionMock);
    });
});
