import { TestBed } from '@angular/core/testing';
import { QuestionSharingService } from './question-sharing.service';
import { Question } from '@app/interfaces/question';

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
        const questionMock: Question = {
            _id: '1',
            text: 'Sample question 1',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        };

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
