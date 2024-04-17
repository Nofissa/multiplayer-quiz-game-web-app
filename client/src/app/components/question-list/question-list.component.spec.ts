import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionInteractionService } from '@app/services/question-interaction/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing/question-sharing.service';
import { qcmQuestionStub, qrlQuestionStub } from '@app/test-stubs/question.stubs';
import { Question } from '@common/question';
import { of } from 'rxjs';
import { QuestionListComponent } from './question-list.component';

describe('QuestionListComponent', () => {
    let component: QuestionListComponent;
    let fixture: ComponentFixture<QuestionListComponent>;
    let interactionService: QuestionInteractionService;
    let sharingService: QuestionSharingService;
    const questionMocks: Question[] = qcmQuestionStub();

    beforeEach(async () => {
        const interactionServiceMock = {
            invokeOnAddQuestion: jasmine.createSpy('invokeOnAddQuestion'),
            invokeOnEditQuestion: jasmine.createSpy('invokeOnEditQuestion'),
            invokeOnDeleteQuestion: jasmine.createSpy('invokeOnDeleteQuestion'),
        };

        const sharingServiceMock = {
            share: jasmine.createSpy('share').and.returnValue(of(null)),
        };

        await TestBed.configureTestingModule({
            declarations: [QuestionListComponent],
            imports: [DragDropModule],
            providers: [
                { provide: QuestionInteractionService, useValue: interactionServiceMock },
                { provide: QuestionSharingService, useValue: sharingServiceMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionListComponent);
        component = fixture.componentInstance;
        interactionService = TestBed.inject(QuestionInteractionService);
        sharingService = TestBed.inject(QuestionSharingService);
        component.interactionService = interactionService;
        component.options = { create: true, edit: true, delete: true, share: true, drag: true, numberOrder: true, displayLastModified: true };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should invoke interaction service on add question', () => {
        component.invokeOnAddQuestion();
        expect(interactionService.invokeOnAddQuestion).toHaveBeenCalled();
    });

    it('should invoke interaction service on edit question', () => {
        const question = questionMocks[0];
        component.invokeOnEditQuestion(question);
        expect(interactionService.invokeOnEditQuestion).toHaveBeenCalledWith(question);
    });

    it('should invoke interaction service on delete question', () => {
        const question = questionMocks[0];
        component.invokeOnDeleteQuestion(question);
        expect(interactionService.invokeOnDeleteQuestion).toHaveBeenCalledWith(question);
    });

    it('should share a question', () => {
        const question = questionMocks[0];
        component.share(question);
        expect(sharingService.share).toHaveBeenCalledWith(question);
        expect(component.sharedQuestions).toContain(question);
    });

    it('should correctly mark question as shared if is shared', () => {
        const sharedQuestion = questionMocks[0];
        const notSharedQuestion = questionMocks[1];

        component.sharedQuestions = [sharedQuestion];

        expect(component.isShared(sharedQuestion)).toBeTrue();
        expect(component.isShared(notSharedQuestion)).toBeFalse();
    });

    it('should isQCM verify if the question is a QCM', () => {
        let response = component.isQcm(questionMocks[0]);
        expect(response).toBeTrue();
        response = component.isQcm(qrlQuestionStub()[0]);
        expect(response).toBeFalse();
    });

    it('should move item in array on drop', () => {
        const firstQuestion = questionMocks[0];
        const secondQuestion = questionMocks[1];

        component.questions = questionMocks;

        const dropList = { data: questionMocks } as CdkDropList;
        const drag = { data: firstQuestion } as CdkDrag;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dropEvent: CdkDragDrop<any[]> = {
            previousIndex: 0,
            currentIndex: 1,
            container: dropList,
            item: drag,
            previousContainer: dropList,
            isPointerOverContainer: false,
            distance: { x: 0, y: 0 },
            dropPoint: { x: 0, y: 0 },
            event: {} as MouseEvent,
        };

        spyOn(component, 'drop').and.callThrough();

        component.drop(dropEvent);

        expect(component.drop).toHaveBeenCalledWith(dropEvent);
        expect(questionMocks[0].text).toBe(secondQuestion.text);
        expect(questionMocks[1].text).toBe(firstQuestion.text);
    });
});
