import { TestBed } from '@angular/core/testing';
import { QuestionInteractionService } from './question-interaction.service';
import { Question } from '@common/question';
import { qcmQuestionStub } from '@app/test-stubs/question.stubs';

describe('QuestionInteractionService', () => {
    let service: QuestionInteractionService;
    const questionMock: Question = qcmQuestionStub()[0];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [QuestionInteractionService],
        });
        service = TestBed.inject(QuestionInteractionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should register and invoke callback for adding question', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const addCallbackSpy = jasmine.createSpy('addCallback', () => {});

        service.registerOnAddQuestion(addCallbackSpy);
        service.invokeOnAddQuestion();

        expect(addCallbackSpy).toHaveBeenCalled();
    });

    it('should register and invoke callback for editing question', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, no-unused-vars
        const editCallbackSpy = jasmine.createSpy('editCallback', (_question: Question) => {});

        service.registerOnEditQuestion(editCallbackSpy);
        service.invokeOnEditQuestion(questionMock);

        expect(editCallbackSpy).toHaveBeenCalledWith(questionMock);
    });

    it('should register and invoke callback for deleting question', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, no-unused-vars
        const deleteCallbackSpy = jasmine.createSpy('deleteCallback', (_question: Question) => {});

        service.registerOnDeleteQuestion(deleteCallbackSpy);
        service.invokeOnDeleteQuestion(questionMock);

        expect(deleteCallbackSpy).toHaveBeenCalledWith(questionMock);
    });

    it('should register and invoke callback for sharing question', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, no-unused-vars
        const shareCallbackSpy = jasmine.createSpy('shareCallback', (_question: Question) => {});

        service.registerOnShareQuestion(shareCallbackSpy);
        service.invokeOnShareQuestion(questionMock);

        expect(shareCallbackSpy).toHaveBeenCalledWith(questionMock);
    });
});
