import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { QuestionListComponent } from './question-list.component';
import { Question } from '@app/interfaces/question';
import { QuestionInteractionService } from '@app/services/question-interaction/question-interaction.service';
import { QuestionSharingService } from '@app/services/question-sharing/question-sharing.service';
import { of } from 'rxjs';

describe('QuestionListComponent', () => {
    let component: QuestionListComponent;
    let fixture: ComponentFixture<QuestionListComponent>;
    let interactionService: QuestionInteractionService;
    let sharingService: QuestionSharingService;
    const questionMock: Question = {
        _id: '1',
        text: 'Sample question',
        type: 'QCM',
        points: 10,
        choices: [],
        lastModification: new Date(),
    };

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
        const question: Question = {
            _id: '1',
            text: 'Sample question',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        };
        component.invokeOnEditQuestion(question);
        expect(interactionService.invokeOnEditQuestion).toHaveBeenCalledWith(question);
    });

    it('should invoke interaction service on delete question', () => {
        const question: Question = {
            _id: '1',
            text: 'Sample question',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        };
        component.invokeOnDeleteQuestion(question);
        expect(interactionService.invokeOnDeleteQuestion).toHaveBeenCalledWith(question);
    });

    it('should share a question', () => {
        component.share(questionMock);
        expect(sharingService.share).toHaveBeenCalledWith(questionMock);
        expect(component.sharedQuestions).toContain(questionMock);
    });

    it('should correctly mark question as shared if is shared', () => {
        const sharedQuestion: Question = {
            _id: '1',
            text: 'Sample question 1',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        };
        const notSharedQuestion: Question = {
            _id: '2',
            text: 'Sample question 2',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        };
        component.sharedQuestions = [sharedQuestion];

        expect(component.isShared(sharedQuestion)).toBeTrue();
        expect(component.isShared(notSharedQuestion)).toBeFalse();
    });

    it('should move item in array on drop', () => {
        const firstQuestion: Question = {
            _id: '1',
            text: 'Sample question 1',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        };
        const secondQuestion: Question = {
            _id: '2',
            text: 'Sample question 2',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        };
        const thirdQuestion: Question = {
            _id: '3',
            text: 'Sample question 3',
            type: 'QCM',
            points: 10,
            choices: [],
            lastModification: new Date(),
        };
        const questionsMock = [firstQuestion, secondQuestion, thirdQuestion];
        component.questions = questionsMock;

        const dropList = { data: questionsMock } as CdkDropList;
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
        expect(questionsMock[0].text).toBe(secondQuestion.text);
        expect(questionsMock[1].text).toBe(firstQuestion.text);
        expect(questionsMock[2].text).toBe(thirdQuestion.text);
    });
});
